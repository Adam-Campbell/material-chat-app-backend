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
    getUsers,
    sendConversationViewedAt
} = require('./socketHandlers');
const actions = require('./actions');


const authRouter = require('./routes/auth');
const conversationsRouter = require('./routes/conversations');
const meRouter = require('./routes/me');
const usersRouter = require('./routes/users');

const app = express();
const server = createServer(app);
const io = socketIO(server);

const currentUsers = new Map();

io.sockets.on('connection', socketioJwt.authorize({
    secret: process.env.SOCKET_AUTH_SECRET,
    timeout: 15000
}))
.on('authenticated', socket => {
    currentUsers.set(socket.decoded_token._id, socket.id);
});

io.on('connection', socket => {
    console.log('A socket connected');
    
    socket.on('disconnect', () => {
        console.log('A socket disconnected')
        currentUsers.delete(socket.decoded_token._id);
    });

    socket.on(actions.getCurrentUsersConversationsRequest, () => {
        getCurrentUsersConversations(socket);
    });
    socket.on(actions.getConversationRequest, ({ conversationId }) => {
        getConversation(socket, conversationId)
    });
    socket.on(actions.sendMessage, ({ conversationId, messageText }) => {
        sendMessage(socket, conversationId, messageText, currentUsers);
    });
    socket.on(actions.sendConversation, ({ userIds, messageText }) => {
        sendConversation(socket, userIds, messageText, currentUsers);
    });
    socket.on(actions.getUsersRequest, ({ query }) => {
        getUsers(socket, query);
    });
    socket.on(actions.sendLastViewed, ({ conversationId, timestamp }) => {
        sendConversationViewedAt(socket, conversationId, timestamp, currentUsers);
    });
});

mongoose.connect(
    process.env.REMOTE_DB_URL,
    { useNewUrlParser: true }
);

app.use(cors({ origin: process.env.CLIENT_DOMAIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.options('*', cors());

app.use(session({
    secret: process.env.SESSION_STORE_SECRET,
    resave: false,
    saveUninitialized: false,
    maxAge: new Date(Date.now() + 900000),
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.use('/auth', authRouter);
app.use('/conversations', conversationsRouter);
app.use('/me', meRouter);
app.use('/users', usersRouter);

server.listen(process.env.PORT, () => console.log(`App is running on port ${process.env.PORT}`));
