const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const path = require("path");

const isStringInvalid = (string) => string === undefined || string.length === 0;
const generateAccessToken = (id, name) => jwt.sign({ userId: id, name }, process.env.TOKEN_SECRET);

const getSignUpPage = (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "html", "signup.html"));
};

const signup = async (req, res) => {
    try {
        const { name, email, phoneNumber, password } = req.body;
        if (isStringInvalid(name) || isStringInvalid(email) || isStringInvalid(phoneNumber) || isStringInvalid(password)) {
            return res.status(400).json({ error: "Bad parameters. Something is missing" });
        }
        const user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ error: 'User already exists. Please login' });
        }
        const hash = await bcrypt.hash(password, 10);
        await User.create({ name, email, phoneNumber, password: hash });
        res.status(201).json({ message: 'Successfully created a new user account' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (isStringInvalid(email) || isStringInvalid(password)) {
            return res.status(400).json({ error: 'Email and password are missing' });
        }
        const user = await User.findOne({ where: { email } });
        if (user) {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (isPasswordValid) {
                return res.status(200).json({
                    message: 'User logged in successfully',
                    token: generateAccessToken(user.id, user.name)
                });
            } else {
                return res.status(401).json({ error: 'User not authorized' });
            }
        } else {
            return res.status(404).json({ error: `User not found` });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(202).json({ listOfUsers: users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Internal Server Error` });
    }
};

module.exports = {
    signup,
    login,
    getUsers,
    getSignUpPage,
};
