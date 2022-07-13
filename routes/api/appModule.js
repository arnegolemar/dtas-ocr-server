const express = require('express');
const router = express.Router();
const AppModule = require('../../controllers/admin-app-module');

const checkAuth = require('../middleware/checkAuth');
const checkAdmin = require('../middleware/check-admin');

router.get('/get', checkAuth, AppModule.get);

router.post('/new', checkAuth, checkAdmin, AppModule.new);

router.post('/update', checkAuth, AppModule.update);

router.post('/generate', checkAuth, AppModule.generate);

module.exports = router;
