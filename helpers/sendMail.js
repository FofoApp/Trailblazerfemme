const nodemailer = require('nodemailer')

exports.sendMail = async (mailTo, otp) => {

    console.log(mailTo, otp)

    // const fofoEmail = `trailblazer.fem@gmail.com`;
    const fofoEmail = `promageforce@gmail.com`;

    return new Promise((resolve, reject) => {

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: fofoEmail,
                pass: "zxwepjfmedbinisx"
            }
        })

        const mail_configs = {
            from: fofoEmail,
            to: mailTo,
            subject: "Trailblazer Femme App OTP",
            text: `Thank you for registering. Your otp code is ${otp} `,
            html: `Thank you for registering. Your otp code is ${otp} `,
        }

        transporter.sendMail(mail_configs, (error, info) => {
            if(error) {
                return reject({ message: 'An error has occured'})
            }
           
            return resolve({ message: 'Email sent successfully'})
        })

    })
}