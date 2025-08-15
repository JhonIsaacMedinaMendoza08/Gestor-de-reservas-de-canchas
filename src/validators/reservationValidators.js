const { body, param } = require('express-validator');

const createReservationValidator = [
    body('date').isISO8601().toDate(), // fecha (YYYY-MM-DD)
    body('start').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:mm
    body('end').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('courtId').isString().isLength({ min: 24 }),
    body('clientName').isString().trim().isLength({ min: 2 }),
];

const updateReservationValidator = [
    param('id').isString().isLength({ min: 24 }),
    body('date').optional().isISO8601().toDate(),
    body('start').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('end').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('clientName').optional().isString().trim().isLength({ min: 2 }),
];

module.exports = { createReservationValidator, updateReservationValidator };
