
const Stripe = require('stripe')('sk_test_...');

const stripPayment = () => {
      Stripe.customers.create({
        email: 'customer@example.com',
      })
      .then(customer => console.log(customer.id))
      .catch(error => console.error(error));
}

module.exports = stripPayment;