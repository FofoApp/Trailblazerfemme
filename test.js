const moment = require('moment');

const calculateNextPayment = (chargeType) => {

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

console.log(calculateNextPayment('years'))
console.log(moment(new Date()).format('YYYY-MM-DD[T00:00:00.000Z]'))