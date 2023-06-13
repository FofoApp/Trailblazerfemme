require('dotenv').config();
const path = require('path');

const express = require('express');
const mongoSanitize = require("express-mongo-sanitize");
const xss = require('xss-clean');
const hpp = require("hpp");
const morgan = require('morgan');
const cors = require('cors');
// const limitter = require('express-rate-limiter');
const createError = require('http-errors');
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const ngrok = process.env.NODE_ENV !== 'production' ? require('ngrok') : null;


// const otpGenerate = require('otp-generator');
// const sdk = require('api')(process.env.SEND_CHAMP_SDK);

const PORT = process.env.PORT || 2000;

global.publicPath = `${__dirname}/public`;

//INITIALIZE DATABASE
const connectDB = require('./initDB');


const CommunityRoutes = require('./routes/CommunityRoutes');
const PlanRoute = require('./routes/PlanRoutes');
const ProfileRoutes = require('./routes/ProfileRoutes');
const AuthRoute = require('./routes/AuthRouter');
const BlogRoutes = require('./routes/BlogRoutes');
const PostRoutes = require('./routes/PostRoutes');
const BlogCommentRoutes = require('./routes/BlogCommentRoutes');
const MyLibraryRoutes = require('./routes/MyLibraryRoutes');
const PodcastRoutes = require('./routes/PodcastRoutes');
const ProductRoutes = require('./routes/ProductRoutes');
const JobRoutes = require('./routes/jobRoutes');
const MembershipRoutes = require('./routes/membershipRoutes');
const AdminDashboardRoutes = require('./routes/AdminDashboardRoutes');
const PaymentRoutes = require('./routes/paymentRoutes');
const CourseRoutes = require('./routes/CourseRoutes');
const StripeRoutes = require('./routes/StripeRoutes');
const WebhookRoutes = require('./routes/webhook');
const WebhookRoutes2 = require('./routes/webh');

// const { recurrentPaymentMiddleware } = require('./middlewares/recurrentPaymentMiddleware');
// const databaseLoader = require('./connection');
// const { hooks } = require('./controllers/stripeController/stripeController');

const app = express();
app.use(morgan('dev'));

app.use(
      cors({
        origin: [
            "http://localhost:2000", 
            "http://localhost:3000", 
            "http://localhost:3001",
            "https://checkout.stripe.com",
            "https://6469ec122631c1598c5d449c--leafy-paprenjak-6ddfe1.netlify.app",
            "https://trailblazeradmin.netlify.app",
      ],
      })
    );

app.use(cors())
app.use(mongoSanitize());
app.use(xss());
// app.use('/api/stripe/webhook2', express.raw({type: "*/*"}));
// app.use('/api/stripe', express.raw({ type: 'application/json' }));
app.use(express.json({
      verify: function(req, res, buf) {
            if (req.originalUrl.startsWith('/webhook')) {
                  req.rawBody = buf.toString();
            }
      }
}));
app.use(express.urlencoded({ extended: true }));
app.use(hpp());



// app.get('/', recurrentPaymentMiddleware, async (_req, res, next) => {

//       try {
//            // https://stackoverflow.com/questions/36193289/moongoose-aggregate-match-does-not-match-ids
//             return res.status(200).send(`Welcome to Fofo-App`);

//       } catch (error) {
//             return res.status(500).send(`${error.message}`);
//       }
// });



// app.post('/api/payment', async (req, res, next) => {

//       const { product, stripToken: token } = req.body;
//       const price = product.price;
    
//       try {
//             const customer =  await stripe.customers.create({
//                   source:token.id,
//                   email: token.email,
//                   });
                  
//             const charge = await stripe.charges.create({
//                   amount: Number(price) * 100,
//                   currency: "usd",
//                   customer: customer.id,
//                   receipt_email: token.email,
//                   description: `Purchased the ${product.description}`,
//             });

//             return res.status(200).send({customer:customer, charge: charge})
//       } catch (error) {
//             console.log("Error:::", error.message)
//             return res.status(200).send({error})
//       }
      
// });


app.get('/', (req, res) => {

      // CALCULATE NEXT PAYMENT

      /**
       *  const { isAfter, isFuture, addMinutes,addHours,addDays,addMonths,addYears,format} = require('date-fns');
       *  
       *  const currentDate = new Date(Date.now());
       *  const nextPayment = addYears(currentDate, 1);
       * 
       *  const dateIsAfter = isAfter(currentDate, nextPayment)
       *  const dateIsFuture = isFuture(nextPayment)
       * 
       *  const daysBetween  = differenceInDays(nextPayment, currentDate)
       *  
       *  if(dateIsAfter) {
       *    console.log("Date is after");
       *  }
       * 
       *  
       * 
       *  
       * 
       * 
       */

      

      


      return res.status(200).json({ message: 'WELCOME TO FOFO APP...' })
})


app.use('/api/stripe', WebhookRoutes2);
app.use('/api/pay', PaymentRoutes);
app.use('/api/stripe', StripeRoutes);
app.use('/api/blog', BlogRoutes);
app.use('/api/library', MyLibraryRoutes);
app.use('/api/podcast', PodcastRoutes);
app.use('/api/course', CourseRoutes);
app.use('/api/blog', BlogCommentRoutes);
app.use('/api/product', ProductRoutes);
app.use('/api/posts', PostRoutes);
app.use('/api/jobs', JobRoutes);
app.use('/api/membership', MembershipRoutes);
app.use('/api/dashboard', AdminDashboardRoutes);
app.use('/api/community', CommunityRoutes);
app.use('/api/plan', PlanRoute);
app.use('/api/profile', ProfileRoutes);
app.use('/api/auth', AuthRoute);



//404 request handler and pass to error handler
app.use(async (req, res, next) => {
      // const err = new Error();
      // err.status = 404;
      //next(err);
      next(createError.NotFound());
});

//error handler
app.use((err, req, res, next) => {

      const errorStatusCode = req.statusCode === 200 ? 500 : err.statusCode
      
      res.status(errorStatusCode).json({ error: { 
            status: errorStatusCode,
            message: err?.message
      }});

      return
});



const startApp = async () => {

      try {

      await connectDB();

      app.listen(PORT, () => console.log(`App running on port: ${PORT}`));


      // if(ngrok) {
      //       ngrok
      //       .connect({
      //         addr: 2000,
      //         subdomain:  'https://8f82-102-89-32-159.ngrok-free.app',
      //         authtoken: process.env.NGROK_AUTH_TOKEN,
      //       })
      //       .then(url => {
      //         console.log(`💳  App URL to see the demo in your browser: ${url}/`);
      //       })
      //       .catch(err => {
      //             if (err.code === 'ECONNREFUSED') {
      //               console.log(`⚠️  Connection refused at ${err.address}:${err.port}`);
      //             } else {
      //               console.log(`⚠️ Ngrok error: ${JSON.stringify(err)}`);
      //             }
      //             process.exit(1);
      //       });
      // }







            
      } catch (error) {
            console.log(error)
            throw new Error("Unable to establish database connection")
      }
}

// App Run
startApp();