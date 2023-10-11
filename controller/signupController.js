const User = require('../model/signupModel');
const bcrypt = require('bcrypt');
const sequelize = require('../utility/database');
const path = require("path");

const getSignUpPage = (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/signup.html"));
};

const postUserSignup = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { name, email, phone, password } = req.body;

        const existingUser = await User.findOne({ where: { email }, transaction: t });

        if (existingUser) {
            await t.rollback();
            return res.status(400).json({ error: 'User already exists. Please login' });
        }

        const hash = await bcrypt.hash(password, 10);

        await User.create({ name, email, phone, password: hash }, { transaction: t });

        await t.commit();

        res.status(201).json({ message: 'Successfully created a new user account' });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const login = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email or password are missing' });
        }

        const user = await User.findOne({ where: { email }, transaction: t });

        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                await t.commit();
                res.status(200).json({
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
        await t.rollback();
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    postUserSignup,
    getSignUpPage,
    login,
}