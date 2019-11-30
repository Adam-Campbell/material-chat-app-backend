const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mongoSessionStore = require('connect-mongo');
const MongoStore = mongoSessionStore(session);

const port = process.env.PORT || 5000;

const authRouter = require('./routes/auth');
const conversationsRouter = require('./routes/conversations');
const meRouter = require('./routes/me');
const usersRouter = require('./routes/users');

const app = express();

mongoose.connect(
    'mongodb://localhost/materialChatApp',
    { useNewUrlParser: true }
);

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.options('*', cors());

app.use(session({
    secret: 'superSecret',
    resave: false,
    saveUninitialized: false,
    maxAge: new Date(Date.now() + 900000),
    //store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.use('/auth', authRouter);
app.use('/conversations', conversationsRouter);
app.use('/me', meRouter);
app.use('/users', usersRouter);

app.listen(port, () => console.log(`App is running on port ${port}`));
