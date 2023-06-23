
const mongoose = require('mongoose');

// let MONGO_URI =  process.env.MONGODB_URI_DEV;
let MONGO_URI = process.env.MONGODB_URI_PROD;


if(!MONGO_URI) {
      throw new Error("Invalid Database URI!");
}

mongoose.set("strictQuery", false);

const connectToDb = async () => {

      if(mongoose.connection.readyState !== 0){
            console.log("Database connection already established");
            return;
      }

      try {
            const { connection } = await mongoose.connect(MONGO_URI);
            if(connection.readyState === 1) {
                  console.log("Connection to database established!");
                  return Promise.resolve(true);
            }
            
      } catch (error) {
            // console.error(error);
            // process.exit(0);
            return Promise.reject(error);
      }

      process.on('SIGINT', function() {
            console.log("Gracefull shutdown");
            // process.exit(0);
            return Promise.reject(false);

      });


}


module.exports = connectToDb;