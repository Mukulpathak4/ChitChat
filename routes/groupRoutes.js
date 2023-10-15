const express = require('express');

const groupController = require('../controller/groupController');

const router = express.Router();

const authenticateMiddleware = require('../authentication/auth');

router.post('/create', authenticateMiddleware.authenticate, groupController.postNewGroup);

router.get('/groups', authenticateMiddleware.authenticate, groupController.getGroups);


module.exports = router;