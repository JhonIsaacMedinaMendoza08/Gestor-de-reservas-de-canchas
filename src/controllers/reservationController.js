const { ObjectId } = require('mongodb');
const { getCollection } = require('../config/db');

function hhmmToMins(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
}

async function list(req, res, next) {
    try {
        const { date, courtId } = req.query;
        const query = {};
        if (date) query.date = String(date);
        if (courtId) query.courtId = new ObjectId(courtId);

        const items = await getCollection('reservations')
            .find(query)
            .sort({ date: 1, startMins: 1 })
            .toArray();

        res.json(items);
    } catch (err) { next(err); }
}

async function create(req, res, next) {
    try {
        const { date, start, end, courtId, clientName } = req.body;

        const court = await getCollection('courts').findOne({ _id: new ObjectId(courtId) });
        if (!court) return res.status(404).json({ message: 'Cancha no encontrada' });

        const startMins = hhmmToMins(start);
        const endMins = hhmmToMins(end);
        if (endMins <= startMins) {
            return res.status(400).json({ message: 'La hora de fin debe ser mayor que la de inicio.' });
        }

        // Validar solapamiento
        const overlap = await getCollection('reservations').findOne({
            courtId: new ObjectId(courtId),
            date: String(date),
            startMins: { $lt: endMins },
            endMins: { $gt: startMins },
        });
        if (overlap) return res.status(409).json({ message: 'Ya existe una reserva en ese horario.' });

        const doc = {
            courtId: new ObjectId(courtId),
            courtName: court.name,   // 👈 Guardamos el nombre de la cancha
            clientName,
            date: String(date),
            start: String(start),
            end: String(end),
            startMins,
            endMins,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await getCollection('reservations').insertOne(doc);
        res.status(201).json({ _id: result.insertedId, ...doc });
    } catch (err) { next(err); }
}

async function update(req, res, next) {
    try {
        const { id } = req.params;
        const payload = req.body;

        const existing = await getCollection('reservations').findOne({ _id: new ObjectId(id) });
        if (!existing) return res.status(404).json({ message: 'No encontrado' });

        const date = payload.date ? String(payload.date) : existing.date;
        const start = payload.start ? String(payload.start) : existing.start;
        const end = payload.end ? String(payload.end) : existing.end;
        const courtId = payload.courtId ? new ObjectId(payload.courtId) : existing.courtId;

        // Si cambiaron de cancha, traemos su nombre
        let courtName = existing.courtName;
        if (payload.courtId) {
            const court = await getCollection('courts').findOne({ _id: new ObjectId(payload.courtId) });
            if (!court) return res.status(404).json({ message: 'Cancha no encontrada' });
            courtName = court.name;
        }

        const startMins = hhmmToMins(start);
        const endMins = hhmmToMins(end);
        if (endMins <= startMins) {
            return res.status(400).json({ message: 'La hora de fin debe ser mayor que la de inicio.' });
        }

        const overlap = await getCollection('reservations').findOne({
            _id: { $ne: new ObjectId(id) },
            courtId,
            date,
            startMins: { $lt: endMins },
            endMins: { $gt: startMins },
        });
        if (overlap) return res.status(409).json({ message: 'Ya existe una reserva en ese horario.' });

        const updates = {
            clientName: payload.clientName ?? existing.clientName,
            date, start, end, startMins, endMins, courtId,
            courtName,   // 👈 mantenemos el nombre actualizado
            updatedAt: new Date(),
        };

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
