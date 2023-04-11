const dotenv = require('dotenv').config();
const mongoose = require('mongoose');

module.exports = async () => {

      // const MONGO_URI = process.env.NODE_ENV === 'development' ?  process.env.MONGODB_URI_DEV : process.env.MONGODB_URI_PROD
      const MONGO_URI = process.env.MONGODB_URI_PROD
      try{
            mongoose.connect(MONGO_URI, {
                  useNewUrlParser: true,
                  useUnifiedTopology: true
            })

            // console.log('MongoDb connection established')

            mongoose.connection.on('connected', () => {
                  console.log("Mongoose connected to MongoDb")
            });
            
      } catch(error) {
            console.log(error.message)
            
            mongoose.connection.on('error', (err) => {
                  console.log(err)
            });
            
            mongoose.connection.on('disconnected', (err) => {
                  console.log("Mongoose connection is disconnected...")
            });
            
            process.on('SIGINT', () =>  {
                  mongoose.connection.close(() => {
                        console.log("Mongoose connection is disconnected due to app termination");
                  })
                  process.exit(0);
            });
      }

}