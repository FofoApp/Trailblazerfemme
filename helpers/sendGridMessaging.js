const sgMail = require('@sendgrid/mail');

const sendGridMail = async (userEmail, otp) => {

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const message = {
  to: [`${userEmail}`],
  from: {
      name: "Trailblazer Femme",
      email: "trailblazer.fem@gmail.com"
  },
  subject: 'Trailblazer Femme App',
  text: `Thank you for registering. Your otp code ${otp} valid for 5mins`,
  html: `Thank you for registering. Your otp code ${otp} valid for 5mins`,
};


    try {
      const result = await sgMail.send(message);
      console.log('result', result)
    } catch (error) {
      console.error(error);

      if (error.response) {
        console.error(error.response.body)
      }
    }

}



module.exports = { sendGridMail }