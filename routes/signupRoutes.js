const express = require('express');

const userController = require('../controller/signupController');

const router = express.Router();

router.get("/", userController.getSignUpPage);

router.post('/signup', userController.postUserSignup);

router.post('/login', userController.login);

module.exports = router;