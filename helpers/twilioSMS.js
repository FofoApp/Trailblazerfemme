
const dotenv = require('dotenv');

dotenv.config();

const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


const sendSMS = (otp) => {
    client.messages
  .create({
     body: `Your otp ${otp} is valid for 15 minutes`,
     from: '+16067220466',
     to:    '+2347065066382'
   })
  .then(message => {
    // console.log("Message sid: ", message)
    return message;
  }).catch((error) => {
    console.log(error)
    return error;
  });
}

module.exports = {sendSMS};