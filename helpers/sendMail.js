const nodemailer = require('nodemailer')
const dotenv = require('dotenv').config();

exports.sendMail = async (mailTo, otp) => {

    const fofoEmail = `trailblazer.fem@gmail.com`;
    // const fofoEmail = `promageforce@gmail.com`;

    const mail_configs = {
        from: fofoEmail,
        to: mailTo,
        subject: "Trailblazer Femme App OTP",
        text: `Thank you for registering. Your otp code is ${otp} `,
        html: `Thank you for registering. Your otp code is ${otp} `,
    }

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: fofoEmail,
            pass: process.env.FOFO_NODEMAILER_GMAIL_PASSWORD
        }
    })


    try {
        
        return await transporter.sendMail(mail_configs);

    } catch (error) {
        throw new Error({ error })
    }

}