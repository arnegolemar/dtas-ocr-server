const express = require('express');
const router = express.Router();
const Document = require('../../controllers/document');

const checkAuth = require('../middleware/checkAuth');
const checkAdmin = require('../middleware/check-admin');

router.get('/get', Document.get);

router.get('/activities', Document.activities);

router.post('/new', checkAuth, checkAdmin, Document.new);

router.post('/update', checkAuth, Document.update);

router.post('/move', checkAuth, Document.move);

router.post('/receive', checkAuth, Document.receive);

module.exports = router;