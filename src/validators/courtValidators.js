const { body, param } = require('express-validator');

const createCourtValidator = [
    body('name').isString().trim().isLength({ min: 2 }),
    body('type').isIn(['futbol', 'baloncesto', 'tenis']),
    body('pricePerHour').isNumeric().toFloat(),
];

const updateCourtValidator = [
    param('id').isString().isLength({ min: 24 }),
    body('name').optional().isString().trim().isLength({ min: 2 }),
    body('type').optional().isIn(['futbol', 'baloncesto', 'tenis']),
    body('pricePerHour').optional().isNumeric().toFloat(),
];

module.exports = { createCourtValidator, updateCourtValidator };