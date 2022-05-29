const sgMail = require('@sendgrid/mail');

const sendGridMail = async (userEmail) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const message = {
  to: [`${userEmail}`],
  from: {
      name: "Trailblazer Femme",
      email: "trailblazer.fem@gmail.com"
  },
  subject: 'Thank you for registering',
  text: 'Its fun coding',
  html: '<strong>Its fun coding</strong>',
};


    try {
      await sgMail.send(message);
    } catch (error) {
      console.error(error);

      if (error.response) {
        console.error(error.response.body)
      }
    }

}



module.exports = { sendGridMail }