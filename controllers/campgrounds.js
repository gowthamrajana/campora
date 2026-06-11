const Campground = require('../models/campground');
const { cloudinary } = require("../cloudinary");
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
  const perPage = 8;
  const page = parseInt(req.query.page) || 1;

  const totalCampgrounds = await Campground.countDocuments({});

  
  const campgrounds = await Campground.find({})
  .sort({ _id: -1 })
  .skip((page - 1) * perPage)
  .limit(perPage);


  const allCampgrounds = await Campground.find({});

  res.render('campgrounds/index', {
    campgrounds,
    allCampgrounds,
    currentPage: page,
    totalPages: Math.ceil(totalCampgrounds / perPage)
  });
};
module.exports.renderNewForm = (req, res) => {
  res.render('campgrounds/new');
}


module.exports.createCampground=async (req, res) =>{
  const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    if (!geoData.features?.length) {
        req.flash('error', 'Could not geocode that location. Please try again and enter a valid location.');
        return res.redirect('/campgrounds/new');
    }
  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.features[0].geometry;
  campground.location = geoData.features[0].place_name;
  campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
  campground.author = req.user._id;
  await campground.save();
  console.log(campground);
  req.flash('success', 'Successfully created campground!');
  res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res, next) => {
  const campground = await Campground.findById(req.params.id).populate({
    path:'reviews',
    populate:{
      path:'author'
    }
  }).populate('author');
  if (!campground) {
    console.log("NOT FOUND TRIGGERED");
    req.flash('error','Campground not found');
    return res.redirect('/campgrounds');
    //return next(new ExpressError('Campground not found', 404));
  }

  res.render('campgrounds/show', {
    campground,
    maptilerApiKey: process.env.MAPTILER_API_KEY
  });
}

module.exports.renderEditForm = async (req, res, next) => {
  const {id} = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    console.log("NOT FOUND TRIGGERED");
    req.flash('error','Campground not found');
    return res.redirect('/campgrounds');
    }
  res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res,) =>{
  const { id } = req.params;
  const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });;
    if (!geoData.features?.length) {
        req.flash('error', 'Could not geocode that location. Please try again and enter a valid location.');
        return res.redirect(`/campgrounds/${id}/edit`);
    }
  const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});
  campground.geometry = geoData.features[0].geometry;
  campground.location = geoData.features[0].place_name;
  const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
  campground.images.push(...imgs);
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
        await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
}
  await campground.save();
  req.flash('success','Successfully updated campground!');
  res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req,res)=>{
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash('success','Successfully deleted!');
  res.redirect(`/campgrounds`);
}