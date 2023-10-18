const express = require('express');

const chatController = require('../controller/chatController');

const router = express.Router();

const authenticateMiddleware = require('../auth/auth');

router.post('/send', authenticateMiddleware.authenticate, chatController.postMessage);

router.get('/messages/:groupId', chatController.getMessages);

module.exports = router;