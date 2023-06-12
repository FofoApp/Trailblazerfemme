const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

// const MONGO_URI = process.env.NODE_ENV === 'development' ?  process.env.MONGODB_URI_DEV : process.env.MONGODB_URI_PROD


module.exports = () => {

      let MONGO_URI = process.env.MONGODB_URI_PROD;

      // let MONGO_URI =  process.env.MONGODB_URI_DEV;

      return new Promise(async(resolve, reject) => {

            mongoose.connection
            .on('error', (error) => {
            
                  process.once("SIGUSR2", function(){
                  process.kill(process.pid, "SIGUSR2")
            });

            // Gracefully shutdown when INTERRUPTED signal occured
            process.on('SIGINT', () =>  {
            mongoose.connection.close(() => {
                  console.log("Mongoose connection is disconnected due to app termination");
            })
            process.exit(0);

            });

            // END PROCESS SIGINT

            })
            .on('close', () => console.log("Database connection closed") )
            .once('open', () => resolve(mongoose.connections[0]) )

            try {
                  
            if(MONGO_URI) {
                  await mongoose.connect(MONGO_URI);
                  console.log("Database connection established");
            }

            // await mongoose.disconnect()                 

            } catch (error) {
                  reject(error)
            }

  
      })
   

}