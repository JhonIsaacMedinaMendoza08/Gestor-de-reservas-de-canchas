const { ObjectId } = require('mongodb');
const { getCollection } = require('../config/db.js');

async function list(req, res, next) {
    try {
        const courts = await getCollection('courts').find({}).sort({ name: 1 }).toArray();
        res.json(courts);
    } catch (err) { next(err); }
}

async function create(req, res, next) {
    try {
        const { name, type, pricePerHour } = req.body;
        const doc = { name, type, pricePerHour, createdAt: new Date() };
        const result = await getCollection('courts').insertOne(doc);
        res.status(201).json({ _id: result.insertedId, ...doc });
    } catch (err) {
        if (err.code === 11000) {
            err.status = 409; err.message = 'La cancha ya existe (nombre único)';
        }
        next(err);
    }
}

async function update(req, res, next) {
    try {
        const { id } = req.params;
        const payload = req.body;
        delete payload._id;
        const result = await getCollection('courts').findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { ...payload, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );
        if (!result.value) return res.status(404).json({ message: 'Actualizacion exitosa' });
        res.json(result.value);
    } catch (err) { next(err); }
}

async function remove(req, res, next) {
    try {
        const { id } = req.params;

        // Bloquear eliminación si tiene reservas futuras
        const hasFuture = await getCollection('reservations').findOne({
            courtId: new ObjectId(id),
            endAt: { $gt: new Date() },
        });
        if (hasFuture) {
            return res.status(409).json({ message: '❌ No se puede eliminar: tiene reservas futuras.' });
        }

        const result = await getCollection('courts').deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No encontrado' });
        }

        return res.status(200).json({ message: 'Cancha eliminada correctamente', id });
    } catch (err) {
        next(err);
    }
}

module.exports = { list, create, update, remove };