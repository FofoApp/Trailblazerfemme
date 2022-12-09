const dotenv = require('dotenv').config();
const mongoose = require('mongoose');

module.exports = async () => {

      try{
            mongoose.connect(process.env.MONGODB_URI, {
                  useNewUrlParser: true,
                  useUnifiedTopology: true
            })

            console.log('MongoDb connection established')
      } catch(error) {
            console.log(error.message)
            mongoose.connection.on('connected', () => {
                  console.log("Mongoose connected to MongoDb")
            });
            
            mongoose.connection.on('error', (err) => {
                  console.log(err)
            });
            
            mongoose.connection.on('disconnected', (err) => {
                  console.log("Mongoose connection is disconnected...")
            });
            
            process.on('SIGINT', () =>  {
                  mongo.connection.close(() => {
                        console.log("Mongoose connection is disconnected due to app termination");
                  })
                  process.exit(0);
            });
      }

      // mongoose.connect(process.env.MONGODB_URI, {
      //       // dbName: process.env.DB_NAME,

      //       useNewUrlParser: true,
      //       useUnifiedTopology: true
      // })
      // .then(() => console.log('MongoDb connection established'))
      // .catch(err => console.log(err.message))
      
      // mongoose.connection.on('connected', () => {
      //       console.log("Mongoose connected to MongoDb")
      // });
      
      // mongoose.connection.on('error', (err) => {
      //       console.log(err)
      // });
      
      // mongoose.connection.on('disconnected', (err) => {
      //       console.log("Mongoose connection is disconnected...")
      // });
      
      // process.on('SIGINT', () =>  {
      //       mongo.connection.close(() => {
      //             console.log("Mongoose connection is disconnected due to app termination");
      //       })
      //       process.exit(0);
      // });
}