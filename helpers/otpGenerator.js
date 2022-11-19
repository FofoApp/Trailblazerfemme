// const otpGenerator = require('otp-generator')


exports.generateFourDigitsOTP = (otp_length = 5) => {
    // const OTP = otpGenerator.generate(4, {digits: true, alphabets: false, upperCaseAlphabets: false, specialChars: false });
     //FIRST METHOD 

    // var digits = '0123456789';
    // var otpLength = 4;
    // var otp = '';

    // for (let i = 0; i < otpLength; i++ ) {
    //     var index = Math.floor(Math.random() * (digits.length));
    //     otp +=  digits[index];
    // }
    // return otp;

    //SECOND METHOD 
    let OTP = '';
    for(let i = 1; i < otp_length; i++) {
        const randomValue =  Math.round(Math.random() * 9);
        OTP += randomValue;
    }

    return OTP;
}

exports.generateSixDigitsOTP = () =>  {
          
    // Declare a digits variable 
    // which stores all digits
    var digits = '0123456789';
    let OTP = '';
    var otpLength = 6;
    for (let i = 0; i < otpLength; i++ ) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

exports.generateAlphanumericOTP = () =>  {
    //Generates 6 digits alphanumeric otp
    // Declare a string variable 
    // which stores all string
    var string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let OTP = '';
    var otpLength = 6;
    // Find the length of string
    var len = string.length;
    for (let i = 0; i < otpLength; i++ ) {
        OTP += string[Math.floor(Math.random() * len)];
    }
    return OTP;
}


