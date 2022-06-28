// const otpGenerator = require('otp-generator')


exports.generateFourDigitsOTP = () => {
    // const OTP = otpGenerator.generate(4, {digits: true, alphabets: false, upperCaseAlphabets: false, specialChars: false });
    
    var digits = '0123456789';
    var otpLength = 4;
    var otp = '';

    for (let i = 0; i < otpLength; i++ ) {
        var index = Math.floor(Math.random() * (digits.length));
        otp +=  digits[index];
    }
    return otp;
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


