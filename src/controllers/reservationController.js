const { ObjectId } = require('mongodb');
const { getCollection } = require('../config/db');

function hhmmToDate(dateOnly, hhmm) {
    // "dateOnly" puede venir como Date (00:00 UTC). Lo convertimos a una fecha local.
    const [h, m] = hhmm.split(':').map(Number);
    const d = new Date(dateOnly);
    d.setHours(h, m, 0, 0);
    return d;
}

async function list(req, res, next) {
    try {
        const { date, courtId } = req.query;
        const query = {};
        if (date) {
            const d = new Date(date);
            const startDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            const endDay = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
            query.startAt = { $gte: startDay, $lt: endDay };
        }
        if (courtId) query.courtId = new ObjectId(courtId);

        const items = await getCollection('reservations')
            .find(query)
            .sort({ startAt: 1 })
            .toArray();

        res.json(items);
    } catch (err) { next(err); }
}

async function create(req, res, next) {
    try {
        const { date, start, end, courtId, clientName } = req.body;

        const court = await getCollection('courts').findOne({ _id: new ObjectId(courtId) });
        if (!court) return res.status(404).json({ message: 'Cancha no encontrada' });

        const startAt = hhmmToDate(date, start);
        const endAt = hhmmToDate(date, end);
        if (endAt <= startAt) return res.status(400).json({ message: 'La hora de fin debe ser mayor que la de inicio.' });

        const overlap = await getCollection('reservations').findOne({
            courtId: new ObjectId(courtId),
            $or: [
                { startAt: { $lt: endAt }, endAt: { $gt: startAt } }
            ]
        });
        if (overlap) return res.status(409).json({ message: 'Ya existe una reserva en ese horario.' });

        const doc = {
            courtId: new ObjectId(courtId),
            clientName,
            date: new Date(new Date(date).setHours(0, 0, 0, 0)),
            startAt,
            endAt,
            createdAt: new Date()
        };

        const result = await getCollection('reservations').insertOne(doc);
        res.status(201).json({ _id: result.insertedId, ...doc });
    } catch (err) { next(err); }
}

async function update(req, res, next) {
    try {
        const { id } = req.params;
        const payload = req.body;

        let updates = { ...payload };
        let startAt, endAt;
        if (payload.date && payload.start) startAt = hhmmToDate(payload.date, payload.start);
        if (payload.date && payload.end) endAt = hhmmToDate(payload.date, payload.end);
        if (startAt) updates.startAt = startAt;
        if (endAt) updates.endAt = endAt;
        if (startAt && endAt && endAt <= startAt) return res.status(400).json({ message: 'La hora de fin debe ser mayor que la de inicio.' });

        const existing = await getCollection('reservations').findOne({ _id: new ObjectId(id) });
        if (!existing) return res.status(404).json({ message: 'No encontrado' });

        const courtId = new ObjectId(payload.courtId || existing.courtId);
        const sAt = updates.startAt || existing.startAt;
        const eAt = updates.endAt || existing.endAt;

        const overlap = await getCollection('reservations').findOne({
            _id: { $ne: new ObjectId(id) },
            courtId,
            $or: [
                { startAt: { $lt: eAt }, endAt: { $gt: sAt } }
            ]
        });
        if (overlap) return res.status(409).json({ message: 'Ya existe una reserva en ese horario.' });

        updates.updatedAt = new Date();
        const result = await getCollection('reservations').findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updates },
            { returnDocument: 'after' }
        );

        res.json(result.value);
    } catch (err) { next(err); }
}

async function remove(req, res, next) {
    try {
        const { id } = req.params;
        const result = await getCollection('reservations').deleteOne({ _id: new ObjectId(id) });
        if (!result.deletedCount) return res.status(404).json({ message: 'No encontrado' });
        res.status(204).send();
    } catch (err) { next(err); }
}

module.exports = { list, create, update, remove };
