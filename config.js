const isProd = process.env.NODE_ENV === 'production';

const port = isProd ? process.env.PORT : 5000;
const dbUrl = isProd ? process.env.REMOTE_DB_URL : 'mongodb://localhost/materialChatApp';
const socketAuthSecret = isProd ? process.env.SOCKET_AUTH_SECRET : 'devSocketAuthSecret';
const sessionStoreSecret = isProd ? processs.env.SESSION_STORE_SECRET : 'devSessionStoreSecret';
const clientDomain = isProd ? process.env.CLIENT_DOMAIN : 'http://localhost:3000';

module.exports = {
    port,
    dbUrl,
    socketAuthSecret,
    sessionStoreSecret,
    clientDomain
};