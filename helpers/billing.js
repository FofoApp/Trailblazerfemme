const moment = require('moment');
const Q = require("q");
// const request = require("request");
const axios = require('axios')
const calculateNextPayment = (chargeType, normalDate) => {
    let currentDate;

    if(!chargeType) return null;

    if(chargeType === 'days') {
        currentDate = moment(new Date()).add(1, chargeType).format("YYYY-MM-DD hh:mm");
        return currentDate;
    } else if(chargeType === 'months') {
        currentDate = moment(new Date()).add(1, chargeType).format("YYYY-MM-DD hh:mm");
        return currentDate;  
    } else if(chargeType === 'years') {
        currentDate = moment(new Date()).add(1, chargeType).format("YYYY-MM-DD hh:mm");
        return currentDate;
    }  
    
    return "Invalid";
}

const  verifyPayment = async (reference) => {
    let options = {
        method: 'get',
        url: `https://api.paystack.co/transaction/verify/${reference}`,
        data: {
          firstName: 'Fred',
          lastName: 'Flintstone'
        },
        headers: {
            'Authorization': "Bearer " + process.env.payStack_Secret
        }
    };
 

   try {
    const response = await axios.get(options);
    let verification_response = JSON.parse(response);

    if (verification_response.status === true && verification_response.data.status === "success") {
        return verification_response;
    } else {
        return "verification error"
    }

   } catch (error) {
       console.log(error)
   }
}


module.exports = {
    calculateNextPayment,
    verifyPayment
}