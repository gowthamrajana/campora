const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const {campgroundSchema} = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Campground =require('./models/campground');
const methodOverride = require('method-override');


mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
  .then(() => {
    console.log("Connected successfully");
  })
  .catch(err => {
    console.log("Connection error:");
    console.log(err);
  });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));// listens for errors anytime
db.once("open", () => {// runs once when connected
  console.log("Database connected");
});

app.engine('ejs', ejsMate);
app.set('view engine','ejs');
app.set('view cache', false);
app.locals.cache = false;
app.set('views',path.join(__dirname,'views'))
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateCampground = (req,res,next) =>{
      const {error} = campgroundSchema.validate(req.body);
    if(error){
      const msg = error.details.map(el => el.message).join(',')
      throw new ExpressError(msg,400);
    }else{
      next();
    }
}

app.get('/',(req,res)=>{
  res.render('home')
})

app.get('/campgrounds', catchAsync(async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds })
}));

app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new');
})

app.post('/campgrounds',validateCampground, catchAsync( async (req, res) =>{
  // if(!req.body.campground)throw new ExpressError('Invalid Campground Data',400);
  const campground = new Campground(req.body.campground);
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`)
}))

app.get('/campgrounds/:id', catchAsync(async (req, res, next) => {
  const campground = await Campground.findById(req.params.id);

  if (!campground) {
    return next(new ExpressError('Campground not found', 404));
  }

  res.render('campgrounds/show', { campground });
}));
app.get('/campgrounds/:id/edit', catchAsync(async (req, res, next) => {
  const campground = await Campground.findById(req.params.id);

  if (!campground) {
    return next(new ExpressError('Campground not found', 404));
  }

  res.render('campgrounds/edit', { campground });
}));

app.put('/campgrounds/:id',validateCampground,catchAsync(async (req, res,) =>{
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});
  res.redirect(`/campgrounds/${campground._id}`)
}));

app.delete('/campgrounds/:id',catchAsync(async (req,res)=>{
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect(`/campgrounds`);
}));

app.all('/{*path}', (req, res, next) => {
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