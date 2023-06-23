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

const PORT = process.env.PORT || 2000;

global.publicPath = `${__dirname}/public`;

//INITIALIZE DATABASE
const connectToDb = require('./dbConnection');


const CommunityRoutes = require('./routes/CommunityRoutes');
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
const CourseRoutes = require('./routes/CourseRoutes');
const StripeRoutes = require('./routes/StripeRoutes');
const WebhookRoutes = require('./routes/webhook');
const WebhookRoutes2 = require('./routes/webh');

const app = express();

if(process.env.NODE_ENV === 'development') {
      app.use(morgan('dev'));
}

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
       */

      return res.status(200).json({ message: 'WELCOME TO FOFO APP...' });
});


app.use('/', WebhookRoutes2);
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

      await connectToDb();

      app.listen(PORT, () => console.log(`App running on port: ${PORT}`));
            
      } catch (error) {
            console.log(error)
            throw new Error("Unable to establish database connection")
      }
}

// App Run
startApp();