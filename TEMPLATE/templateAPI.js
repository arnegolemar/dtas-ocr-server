const express = require('express');
const router = express.Router();
const Temp1 = require('../../controllers/temp3');

const checkAuth = require('../middleware/checkAuth');
const checkAdmin = require('../middleware/check-admin');

router.get('/get', Temp1.get);

router.post('/new', checkAuth, checkAdmin, Temp1.new);

router.post('/update', checkAuth, Temp1.update);

module.exports = router;