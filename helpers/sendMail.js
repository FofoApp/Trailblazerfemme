const nodemailer = require('nodemailer')

const sendMail = async (mailTo, otp) => {
    
    const fofoEmail = `trailblazer.fem@gmail.com`;

    return new Promise((resolve, reject) => {

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: fofoEmail,
                pass: ""
            }
        })

        const mail_configs = {
            from: fofoEmail,
            to: mailTo,
            subject: "Trailblazer Femme App OTP",
            text: `Thank you for registering. Your otp code ${otp} valid for 5mins`,
            html: `Thank you for registering. Your otp code ${otp} valid for 5mins`,
        }

        transporter.sendMail(mail_configs, (error, info) => {
            if(error) {
                return reject({ message: 'An error has occured'})
            }

            return resolve({ message: 'Email sent successfully'})
        })

    })
}