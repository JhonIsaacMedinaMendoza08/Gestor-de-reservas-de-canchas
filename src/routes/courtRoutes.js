const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate.js');
const { createCourtValidator, updateCourtValidator } = require('../validators/courtValidators.js');
const controller = require('../controllers/courtController.js');

router.get('/get/', controller.list);
router.post('/post/', createCourtValidator, validate, controller.create);
router.put('/put/:id', updateCourtValidator, validate, controller.update);
router.delete('/delete/:id', controller.remove);

module.exports = router;