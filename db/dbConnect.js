const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");
const localUrl = 'mongodb://localhost:27017';
const localDBNam = 'local_note_application';


function connectDb() {
    const con = mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    return con;
}


//connecting locally with mongo client
function connectDBLocally() {
    const client = new MongoClient(localUrl, {  });
    const conn = client.connect();
    console.log("connected to database successfully")
    return conn
}

//conecting with mongoose locally
function connectWithMongooseLocally(){
    const connection = mongoose.connect(`mongodb://127.0.0.1:27017/${localDBNam}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
     //   poolSize: 10, // Set the pool size for connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    })
    return connection;
}

module.exports = { connectDb, connectDBLocally, connectWithMongooseLocally };