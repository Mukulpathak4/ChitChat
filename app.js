require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

const sequelize = require('./utility/database');
const userRoutes = require('./routes/signupRoutes');
const chatRoutes = require('./routes/chatRoutes');
const groupRoutes = require('./routes/groupRoutes');


app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // To serve static files from the "public" directory

app.use('/', userRoutes);
app.use('/chats', chatRoutes);
app.use('/group', groupRoutes);


sequelize.sync().then(() => {
    app.listen(port, () => {
        console.log('Server is running on port ' + port);
    });
}).catch(err => {
    console.error('Error starting the server: ' + err);
});
