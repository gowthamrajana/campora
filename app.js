if(process.env.NODE_ENV !== "production"){
  require('dotenv').config();
}


const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const {campgroundSchema,reviewSchema} = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const Campground =require('./models/campground');
const methodOverride = require('method-override');
const Review = require('./models/review');
const campground = require('./models/campground');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const cookie = require('express-session/session/cookie.js');
const { MongoStore } = require('connect-mongo');


const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';
mongoose.connect(dbUrl)
  .then(() => {
    console.log("Connected successfully");
  })
  .catch(err => {
    console.log("Connection error:");
    console.log(err);
  });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
      secret,
  }
});

app.engine('ejs', ejsMate);
app.set('view engine','ejs');
app.set('view cache', false);
app.locals.cache = false;
app.set('views',path.join(__dirname,'views'))
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
  replaceWith: '_',
}));
app.use(
  helmet()
);


const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/", 
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/", 
];
const connectSrcUrls = [
  "https://api.maptiler.com/", 
];

const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dslilo3zi/", 
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


const sessionConfig = {
  store, 
  name : 'session',
  secret,
  resave : false,
  saveUninitialized : false,
  cookie : {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 *60 *24 * 7,
    maxAge : 1000 * 60 *60 *24 * 7
  }
}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success')[0];
  res.locals.error = req.flash('error')[0];
  next();
});


app.use('/', userRoutes);
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/reviews',reviewRoutes)

app.get('/',(req,res)=>{
  res.render('home')
})



app.all('/{*path}', (req, res, next) => {
  console.log('Not Found:', req.originalUrl);
  next(new ExpressError('page not found', 404));
});

app.use((err, req, res, next) => {
  console.log("ERROR 👉", err);
  const{statusCode = 500} = err;
 if(!err.message) err.message='Oh No,Something Went Wrong!!'
  res.status(statusCode).render('error',{err});
});


app.listen(3000,()=>{
  console.log("serving on port")
})