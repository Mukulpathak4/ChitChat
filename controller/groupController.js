const Group = require('../model/groupModel');
const User = require('../model/userModel');
const UserGroup = require('../model/userGroupModel');
const sequelize = require('../utility/database');

const isStringInvalid = (string) => string == undefined || string.length === 0;

const postNewGroup = async (req, res) => {
    try {
        const { groupName } = req.body;
        const name = req.user.name;

        if (isStringInvalid(groupName)) {
            return res.status(400).json({ error: "Parameters are missing" });
        }

        const group = await Group.create({ name: groupName, createdBy: name, userId: req.user.id });
        const userGroup = await UserGroup.create({ userId: req.user.id, groupId: group.id, isAdmin: true });

        res.status(202).json({ newGroup: group, message: `Successfully created ${groupName}`, userGroup });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getGroups = async (req, res) => {
    try {
        const userGroup = await UserGroup.findAll({ where: { userId: req.user.id } });
        const groupsList = await Promise.all(userGroup.map(async (ug) => await Group.findByPk(ug.groupId)));
        const users = await User.findAll();

        res.status(201).json({ listOfUsers: users, groupsList, userGroup });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const addUserToGroup = async (req, res) => {
    try {
        const { userId, groupId } = req.params;
        const userGroup = await UserGroup.create({ userId, groupId, isAdmin: false });

        res.status(202).json({ userGroup, message: 'Successfully added user to your group' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getGroupMembers = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userGroups = await UserGroup.findAll({ where: { groupId } });

        const userIds = userGroups.map((ug) => ug.userId);
        const usersDetails = await Promise.all(userIds.map((userId) => User.findByPk(userId)));

        res.status(200).json({ usersDetails, userGroups });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const deleteGroupMember = async (req, res) => {
    try {
        const { id } = req.params;
        await UserGroup.destroy({ where: { id } });
        res.status(200).json({ message: `Successfully removed group member` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Internal Server Error` });
    }
}

const updateIsAdmin = async (req, res) => {
    try {
        const userGroupId = req.params.userGroupId;
        const userGroup = await UserGroup.findOne({ where: { id: userGroupId } });
        await userGroup.update({ isAdmin: true });
        res.status(202).json({ message: `Successfully made Admin of Group` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Internal Server Error` });
    }
}

module.exports = {
    postNewGroup,
    getGroups,
    addUserToGroup,
    getGroupMembers,
    deleteGroupMember,
    updateIsAdmin
};
