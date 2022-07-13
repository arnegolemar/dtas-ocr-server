const express = require('express');
const router = express.Router();
const Office = require('../../controllers/office');

const checkAuth = require('../middleware/checkAuth');
const checkAdmin = require('../middleware/check-admin');

router.get('/get', Office.get);

router.post('/new', checkAuth, checkAdmin, Office.new);

router.post('/update', checkAuth, Office.update);

module.exports = router;