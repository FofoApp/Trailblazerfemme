const mongoose = require('mongoose');

module.exports = () => {
      mongoose.connect(process.env.MONGODB_URI, {
            // dbName: process.env.DB_NAME,

            useNewUrlParser: true,
            useUnifiedTopology: true
      })
      .then(() => console.log('Connected to MongoDb'))
      .catch(err => console.log(err.message))
      
      mongoose.connection.on('connected', () => {
            console.log("Mongoose connected to db")
      });
      
      mongoose.connection.on('error', (err) => {
            console.log(err)
      });
      
      mongoose.connection.on('disconnected', (err) => {
            console.log("Mongoose connectedion is disconnected...")
      });
      
      process.on('SIGINT', () =>  {
            mongo.connection.close(() => {
                  console.log("Mongoose connection is disconnected due to app termination");
            })
            process.exit(0);
      });
}