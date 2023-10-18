const Sequelize = require('sequelize');

const sequelize = require('../utility/database');

const ArchivedChats = sequelize.define('archived_chats', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    message: Sequelize.STRING,
    sender: Sequelize.STRING
  });
  
  module.exports = ArchivedChats;