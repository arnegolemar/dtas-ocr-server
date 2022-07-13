const express = require('express');
const fs = require('fs');
const router = express.Router();
const UserComment = require('../../controllers/userComment');

const checkAuth = require('../middleware/checkAuth');
const checkAdmin = require('../middleware/check-admin');

router.get('/get', checkAuth, UserComment.get);
router.get('/get/mine', checkAuth, UserComment.getMine);

router.post('/new', checkAuth, UserComment.new);

router.post('/comment-reply', checkAuth, UserComment.commentReply);

router.post('/update', UserComment.update);

module.exports = router;
