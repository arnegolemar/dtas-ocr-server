const express = require('express');
const router = express.Router();
const Role = require('../../controllers/role');

const checkAuth = require('../middleware/checkAuth');
const checkAdmin = require('../middleware/check-admin');

router.get('/get', Role.get);

router.post('/new', checkAuth, checkAdmin, Role.new);

router.post('/update', checkAuth, Role.update);

module.exports = router;
