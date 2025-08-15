const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate.js');
const { createReservationValidator, updateReservationValidator } = require('../validators/reservationValidators.js');
const controller = require('../controllers/reservationController.js');

router.get('/get/', controller.list);
router.post('/post/', createReservationValidator, validate, controller.create);
router.put('/put/:id', updateReservationValidator, validate, controller.update);
router.delete('/delete/:id', controller.remove);

module.exports = router;