
const mongoose = require('mongoose');


const connectToDb = async () => {

      mongoose.set("strictQuery", false);

      let MONGO_URI = process.env.MONGODB_URI_PROD;
     
      // let MONGO_URI =  process.env.MONGODB_URI_DEV;

      try {

            if(!MONGO_URI) {
                  console.error("Database URI not found");
                  return;
            }

            await mongoose.connect(MONGO_URI);
            console.log("Connection to database established!");
            
      } catch (error) {
            console.error(error);
            process.exit(0);
      }

      process.on('SIGINT', function() {
            console.log("Gracefull shutdown");
            process.exit(0);

      });


}


module.exports = connectToDb;