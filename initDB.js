const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

module.exports = async () => {

      // const MONGO_URI = process.env.NODE_ENV === 'development' ?  process.env.MONGODB_URI_DEV : process.env.MONGODB_URI_PROD

      let MONGO_URI = process.env.MONGODB_URI_PROD;

      // let MONGO_URI =  process.env.MONGODB_URI_DEV;

      try { 

            if(MONGO_URI){
                  await mongoose.connect(MONGO_URI);
                  console.log("Database connection established")
                  mongoose.connection.on('connected', () => {
                        console.log("Mongoose connected to MongoDb")
                  });
                  mongoose.connection.on('error', (error) => {
                        // if(error?.code == 'ECONNREFUSED') {
                        //       MONGO_URI = process.env.MONGODB_URI_DEV
                        // }
                        
                  });

            }



            
      } catch(error) {

            if(error?.message === "MONGO_URI is not defined") {
                  throw new Error("Unable to establish database connection")
            }
            
             mongoose.connection.on('error', (err) => {
                  if(err) {
                      
                        process.exit();
                  }
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