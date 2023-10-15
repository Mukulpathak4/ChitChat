// Import necessary modules and models
const Group = require('../models/groupModel');
const User = require('../models/userModel');
const UserGroup = require('../models/userGroupModel');
const sequelize = require('../util/config');

// Helper function to check if a string is invalid (undefined or empty)
const isStringInvalid = (string) => {
    return string == undefined || string.length === 0;
}

// Add a new group to the groups table
const postNewGroup = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { groupName } = req.body;
        const name = req.user.name;

        // Check if the groupName is invalid
        if (isStringInvalid(groupName)) {
            return res.status(400).json({ error: "Parameters are missing" });
        }

        // Create a new group in the Group model
        const group = await Group.create({ name: groupName, createdBy: name, userId: req.user.id }, { transaction: t });
        // Create a user-group association in the UserGroup model with isAdmin set to true
        const userGroup = await UserGroup.create({ userId: req.user.id, groupId: group.dataValues.id, isAdmin: true }, { transaction: t });

        await t.commit();
        res.status(202).json({ newGroup: group, message: `Successfully created ${groupName}`, userGroup });
    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Get a list of groups based on the user's ID
const getGroups = async (req, res) => {
    try {
        // Find all user-group associations with the specified userId
        const userGroup = await UserGroup.findAll({ where: { userId: req.user.id } });

        let groupsList = [];
        for (let i = 0; i < userGroup.length; i++) {
            let groupId = userGroup[i].dataValues.groupId;
            // Find the group based on groupId
            const group = await Group.findByPk(groupId);
            groupsList.push(group);
        }

        // Retrieve all users
        const users = await User.findAll();

        res.status(201).json({ listOfUsers: users, groupsList, userGroup });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



module.exports = {
    postNewGroup,
    getGroups,
}
