require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();



const port = process.env.PORT || 3000;

const sequelize = require('./utility/database');
const User = require('./model/signupModel');


const userRoutes = require('./routes/signupRoutes');


app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));//To serve static file from public

app.use('/', userRoutes);


sequelize.sync().then(() => {
    app.listen(port);
    console.log('server is running');
}).catch(err => {
    console.log(err);
})
