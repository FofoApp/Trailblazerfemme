const sgMail = require('@sendgrid/mail');

exports.sendGridMail = async (userEmail, otp) => {

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
      return result;

    } catch (error) {
      
      if (error.response) {
        console.error(error.response.body)
      }

      console.error(error);
    }

}
