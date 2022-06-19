require('dotenv').config();
const path = require('path');

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
// const limitter = require('express-rate-limiter');
const createError = require('http-errors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);



const PORT = process.env.PORT || 2000;

global.publicPath = `${__dirname}/public`;

require('./initDB')();

// const ProductRoute = require('./routes/ProductRouter');
const FollowersAndFollowingRoutes = require('./routes/followersAndFollowingRoutes');
const CommunityRoutes = require('./routes/CommunityRoutes');
const PlanRoute = require('./routes/PlanRoutes');
const ProfileRoutes = require('./routes/ProfileRoutes');
const AuthRoute = require('./routes/AuthRouter');
const BlogRoutes = require('./routes/BlogRoutes');
const PostRoutes = require('./routes/PostRoutes');
const BlogCommentRoutes = require('./routes/BlogCommentRoutes');
const BookLibraryRoutes = require('./routes/BookLibraryRoutes');
const BookRoutes = require('./routes/BookRoutes');
const MyLibraryRoutes = require('./routes/MyLibraryRoutes');
const PodcastRoutes = require('./routes/PodcastRoutes');
const ProductRoutes = require('./routes/ProductRoutes');
const JobRoutes = require('./routes/jobRoutes');
const MembershipRoutes = require('./routes/membershipRoutes');
const AdminDashboardRoutes = require('./routes/AdminDashboardRoutes');

require('./helpers/initRedis');

const app = express();
app.use(morgan('tiny'));


app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




app.get('/', async (req, res, next) => {
      return res.status(200).send("Welcome to Fofo-App");
});

app.post('/api/payment', async (req, res, next) => {
      const { product, stripToken: token } = req.body;
    
      try {
            const customer =  await stripe.customers.create({
                  source:token.id,
                  email: token.email,
                  });
                  
            const charge = await stripe.charges.create({
                  amount: product.price * 100,
                  currency: "usd",
                  customer: customer.id,
                  receipt_email: token.email,
                  description: `Purchased the ${product.description}`,
            });

            return res.status(200).send({customer:customer, charge: charge})
      } catch (error) {
            console.log("Error:::", error.message)
            return res.status(200).send({error})
      }
      
});


// app.use('/api/products', ProductRoute);
app.use('/api/blog', BlogRoutes);
app.use('/api/library', MyLibraryRoutes);
app.use('/api/podcast', PodcastRoutes);
app.use('/api/blog', BlogCommentRoutes);
app.use('/api/product', ProductRoutes);
app.use('/api/posts', PostRoutes);
app.use('/api/jobs', JobRoutes);
app.use('/api/membership', MembershipRoutes);
app.use('/api/dashboard', AdminDashboardRoutes);
// app.use('/api/library', BookLibraryRoutes);
app.use('/api/books', BookRoutes);

// app.use('/api', FollowersAndFollowingRoutes);
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
      res.status(err.status || 500);
      return res.send({ error: { 
            status: err.status || 500,
            message: err.message
      }});
});


// app configurations
app.set('port', PORT);

app.listen(PORT, () => console.log(`App running on port: ${PORT}`));