const express = require('express');
const router = express.Router();
const Position = require('../../controllers/position');

const checkAuth = require('../middleware/checkAuth');
const checkAdmin = require('../middleware/check-admin');

router.get('/get', Position.get);

router.post('/new', checkAuth, checkAdmin, Position.new);

router.post('/update', checkAuth, Position.update);

module.exports = router;
