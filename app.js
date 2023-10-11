require('dotenv').config();
const cors = require('cors');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));
const sequelize = require('./utility/database');
const userRoutes = require('./routes/signupRoutes');

app.use(cors({
  origin: "*"
}));

app.use(express.json());

app.use('/', userRoutes);

sequelize.sync().then(() => {
    app.listen(port);
    console.log('server is running');
}).catch(err => {
    console.log(err);
});
