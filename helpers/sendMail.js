require('dotenv').config();
const nodemailer = require('nodemailer');
const { otpTemplate } = require('./emailTemplate');

exports.sendMail = async (mailTo, otp, firstname) => {

    const fofoEmail = `trailblazer.fem@gmail.com`;

    const mail_configs = {
        from: fofoEmail,
        to: mailTo,
        subject: "Your OTP to TrailBlazerFEMME Community App",
        text: `Thank you for registering. Your otp code is ${otp} `,
        html: otpTemplate(otp, firstname),
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

    return new Promise((resolve, reject) => {
        transporter.sendMail(mail_configs, (error, response) => {
            if(error) {
                reject(error?.message)
            } else {
                resolve(response)
            }
        })
    })


    // return await transporter.sendMail(mail_configs)
    // try{
    //     await transporter.sendMail(mail_configs);
    // } catch(error) {
    //      res.status(500).json({ error: 'Error sending email'})
    //      return
    // }

}