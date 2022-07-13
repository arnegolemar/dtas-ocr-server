const express = require('express');
const router = express.Router();
const Student = require('../../controllers/student');

const checkAuth = require('../middleware/checkAuth');
const checkAdmin = require('../middleware/check-admin');

router.get('/get', checkAuth, Student.get);

router.get('/get-my-info', checkAuth, Student.getMyInfo);

router.post('/new', checkAuth, checkAdmin, Student.new);

router.post('/update', checkAuth, Student.update);

router.post('/login', Student.login);

router.post('/update-password', checkAuth, Student.updatePassword);


module.exports = router;