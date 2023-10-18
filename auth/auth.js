const User = require('../model/userModel');
const Group = require('../model/groupModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization');

        const user = jwt.verify(token, process.env.TOKEN_SECRET);
        const group = jwt.verify(token, process.env.TOKEN_SECRET);

        const users = await User.findByPk(user.userId);
        const groups = await Group.findByPk(group.GroupId);

        req.user = users;
        req.group = groups;

        next();
    } catch (err) {
        console.error(err);
        return res.status(401).json({ success: false });
    }
};

module.exports = {
    authenticate,
};
