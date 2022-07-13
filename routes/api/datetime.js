const express = require('express');
const router = express.Router();
const DateTime = require('../../controllers/datetime');

const checkAuth = require('../middleware/checkAuth');

// router.get('/get-asia-manila', checkAuth, DateTime.getAsiaManila);
router.get('/get-asia-manila', DateTime.getAsiaManila);

module.exports = router;
