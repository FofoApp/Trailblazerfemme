const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

module.exports = async () => {

      // const MONGO_URI = process.env.NODE_ENV === 'development' ?  process.env.MONGODB_URI_DEV : process.env.MONGODB_URI_PROD

      // let MONGO_URI = process.env.MONGODB_URI_PROD;

      let MONGO_URI =  process.env.MONGODB_URI_DEV;

      try {

            mongoose.connect(MONGO_URI, {
                  // useNewUrlParser: true,
                  // useUnifiedTopology: true
            })

            mongoose.connection.on('connected', () => {
                  console.log("Mongoose connected to MongoDb")
            });
            mongoose.connection.on('error', (error) => {
                  // if(error?.code == 'ECONNREFUSED') {
                  //       MONGO_URI = process.env.MONGODB_URI_DEV
                  // }
                  
            });
            
      } catch(error) {
            // console.log(error)
            
            mongoose.connection.on('error', (err) => {
                  // console.log(err)
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