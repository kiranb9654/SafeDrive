const express = require('express');
const dotenv = require('dotenv');


dotenv.config();

const userRouter = require('./routes/user.routes');
const connectToDB = require('./config/db');


connectToDB();
// console.log("MONGO_URI is:", process.env.MONGO_URI);

const app = express();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/user', userRouter);

app.listen(3000, () => {
    console.log('server is running on port 3000');
});
