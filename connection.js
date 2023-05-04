const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

    // const MONGO_URI = process.env.MONGODB_URI_PROD;
      const MONGO_URI = process.env.MONGODB_URI_DEV;

const clients = {};

let connectionTimeout;

function throwTimeoutError() {
    connectionTimeout = setTimeout(() => {
        throw new DatabaseError();
    }, 1000);
}

function instanceEventListeners({ conn }) {

    conn.on('connected', () =>  { 
        console.log("Database Connection status: Connected");
        clearTimeout(connectionTimeout);
    });
    conn.on('disconnected', () =>  { 
        console.log("Database Connection status: Disconnected");
        throwTimeoutError();
    });
    conn.on('reconnected', () =>  { 
        console.log("Database Connection status: Reconnected");
        clearTimeout(connectionTimeout);
    });
    conn.on('close', () =>  {
        console.log("Database Connection status: Closed");
        clearTimeout(connectionTimeout);
    });

}



exports.init = async ({ MONGODB_HOST }) => {
    const mongoInstance  = await mongoose.createConnection(MONGODB_HOST, {
        useNewUrlParser: true,
        keepAlive: true,
        // autoReconnect: true,
        // reconnectTries: 3,
        // reconnectInterval: 5000,
    });

    clients.mongoInstance = mongoInstance;

    instanceEventListeners({ conn: mongoInstance })

}

exports.closeConnection = () => {
    Object.keys(clients).map(([key, value], conn) => conn.close());
}


exports.getClients = () => clients;