const User = require('../model/signupModel');
const bcrypt = require('bcrypt');
const sequelize = require('../utility/database');
const path = require("path");

const getSignUpPage = (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/signup.html"));
};

const postUserSignup = async(req, res)=>{
    const t = await sequelize.transaction();
    try{
        const { name, email, phone, password } = req.body;

        const user = await User.findOne({ where: { email } }, { transaction: t });

        if (user) {
            return res.status(400).json({ error: 'User already exists. Please login' });
        }
        const hash = await bcrypt.hash(password, 10);

        await User.create({ name, email, phone, password: hash }, { transaction: t })
        await t.commit();
        alert("Successfully signedUp")
        res.status(201).json({ message: 'Successfully created a new user account' });
    }
    catch(err){
        await t.rollback();
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
module.exports = {
    postUserSignup,
    getSignUpPage,
}