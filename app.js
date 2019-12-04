const express = require('express');
const { createServer } = require('http');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mongoSessionStore = require('connect-mongo');
const MongoStore = mongoSessionStore(session);
const socketIO = require('socket.io');
const socketioJwt = require('socketio-jwt');
const {
    getCurrentUsersConversations,
    getConversation,
    sendMessage,
    sendConversation,
    getUsers
} = require('./socketHandlers');
const actions = require('./actions');

const port = process.env.PORT || 5000;

const authRouter = require('./routes/auth');
const conversationsRouter = require('./routes/conversations');
const meRouter = require('./routes/me');
const usersRouter = require('./routes/users');

const app = express();
const server = createServer(app);
const io = socketIO(server);

const currentUsers = new Map();

io.sockets.on('connection', socketioJwt.authorize({
    secret: 'foobar',
    timeout: 15000
}))
.on('authenticated', socket => {
    currentUsers.set(socket.decoded_token._id, socket.id);
    console.log(`This is the socket for user with id ${socket.decoded_token._id}`);
})


io.on('connection', socket => {
    console.log('A socket connected');
    //console.log(socket.id);
    //console.log(io.sockets);
    
    socket.on('disconnect', () => {
        console.log('A socket disconnected')
        currentUsers.delete(socket.decoded_token._id);
    });

    socket.on('foo', data => {
        console.log(data);
        console.log(`From inside foo ${socket.decoded_token._id}`);
        socket.emit('baz', 'This is baz');
    });

    socket.on(actions.getCurrentUsersConversationsRequest, () => {
        getCurrentUsersConversations(socket);
    });
    socket.on(actions.getConversationRequest, conversationId => {
        getConversation(socket, conversationId)
    });
    socket.on(actions.sendMessageRequest, (conversationId, messageText) => {
        sendMessage(socket, conversationId, messageText, currentUsers);
    });
    socket.on(actions.sendConversationRequest, (userId, messageText) => {
        sendConversation(socket, userId, messageText, currentUsers);
    });
    socket.on(actions.getUsersRequest, query => {
        getUsers(socket, query);
    });
});

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

//app.use(sessionInstance);

app.use('/auth', authRouter);
app.use('/conversations', conversationsRouter);
app.use('/me', meRouter);
app.use('/users', usersRouter);

server.listen(port, () => console.log(`App is running on port ${port}`));
