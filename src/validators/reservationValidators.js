const { body, param } = require('express-validator');
const { ObjectId } = require('mongodb');

// date = YYYY-MM-DD, start/end = HH:mm (24h)
const HHMM = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
const YMD = /^\d{4}-\d{2}-\d{2}$/;

const createReservationValidator = [
    body('date').matches(YMD).withMessage('date debe ser YYYY-MM-DD'),
    body('start').matches(HHMM).withMessage('start debe ser HH:mm (00-23:00-59)'),
    body('end').matches(HHMM).withMessage('end debe ser HH:mm (00-23:00-59)'),
    body('courtId').custom(v => ObjectId.isValid(v)).withMessage('courtId inválido'),
    body('clientName').isString().trim().isLength({ min: 2 }),
];

const updateReservationValidator = [
    param('id').custom(v => ObjectId.isValid(v)).withMessage('id inválido'),
    body('date').optional().matches(YMD),
    body('start').optional().matches(HHMM),
    body('end').optional().matches(HHMM),
    body('courtId').optional().custom(v => ObjectId.isValid(v)).withMessage('courtId inválido'),
    body('clientName').optional().isString().trim().isLength({ min: 2 }),
];

module.exports = { createReservationValidator, updateReservationValidator };
