require('dotenv').config();
const nodemailer = require('nodemailer');
const { otpTemplate } = require('./emailTemplate');

exports.sendMail = async (mailTo, otp,) => {

    const fofoEmail = `trailblazer.fem@gmail.com`;

    const mail_configs = {
        from: fofoEmail,
        to: mailTo,
        subject: "Trailblazer Femme App OTP",
        text: `Thank you for registering. Your otp code is ${otp} `,
        html: otpTemplate(otp),
    }

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        service: 'gmail',
        auth: {
            user: fofoEmail,
            pass: process.env.FOFO_NODEMAILER_GMAIL_PASSWORD
        }
    })
    return await transporter.sendMail(mail_configs)
    // try{
    //     await transporter.sendMail(mail_configs);
    // } catch(error) {
    //      res.status(500).json({ error: 'Error sending email'})
    //      return
    // }

}