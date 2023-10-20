require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const upload = multer();

const app = express();
const server = require('http').createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: "*"
  }
});

const port = process.env.PORT || 3000;

const sequelize = require('./utility/database');
const User = require('./model/userModel');
const Chats = require('./model/chatModel');
const Group = require('./model/groupModel');
const UserGroup = require('./model/userGroupModel');
const ArchivedChats = require('./model/archivedChatModel');

const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const groupRoutes = require('./routes/groupRoutes');
const fileRoutes = require('./routes/multimediaRoutes');

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));//To serve static file from public

app.use('/', userRoutes);
app.use('/chats', chatRoutes);
app.use('/group', groupRoutes);
app.use('/files', upload.single('userFile'), fileRoutes);

User.hasMany(Chats);
Chats.belongsTo(User);

Group.hasMany(Chats);
Chats.belongsTo(Group);

User.belongsToMany(Group, { through: UserGroup });
Group.belongsToMany(User, { through: UserGroup });

User.hasMany(ArchivedChats);
Group.hasMany(ArchivedChats);

io.on("connect", (socket) => {
    socket.on('user', () => {
        console.log(`user is connected`);
    })

    socket.on('joined-group', group => {
        socket.join(group);
    })

    socket.on('send-message', message => {
        socket.to(message.groupId).emit('received-message', message);
    })

    socket.on('disconnect', () => {
        console.log(`user is disconnected`);
    })
});

sequelize.sync().then(() => {
    server.listen(port);
    console.log('server is running');
}).catch(err => {
    console.log(err);
})
