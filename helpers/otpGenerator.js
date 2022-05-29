// const otpGenerator = require('otp-generator')


const generateFourDigitsOTP = (req, res, next) => {
    // const OTP = otpGenerator.generate(4, {digits: true, alphabets: false, upperCaseAlphabets: false, specialChars: false });
    
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 4; i++ ) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

function generateSixDigitsOTP() {
          
    // Declare a digits variable 
    // which stores all digits
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++ ) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

function generateAlphanumericOTP() {
    //Generates 6 digits alphanumeric otp
    // Declare a string variable 
    // which stores all string
    var string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let OTP = '';
      
    // Find the length of string
    var len = string.length;
    for (let i = 0; i < 6; i++ ) {
        OTP += string[Math.floor(Math.random() * len)];
    }
    return OTP;
}

module.exports = {
    generateFourDigitsOTP,
    generateSixDigitsOTP,
    generateAlphanumericOTP
}