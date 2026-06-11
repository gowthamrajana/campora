const express = require('express');
const app = express();
const path = require('path');

const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');

const mongoose = require('mongoose');
const Campground = require('../models/campground');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
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

const sample = (array) =>
  array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {

  await Campground.deleteMany({});

  for (let i = 0; i < 50; i++) {

    const price = Math.floor(Math.random() * 30) + 10;

    const randomCity = Math.floor(Math.random() * cities.length);

    const camp = new Campground({
      author: '6a26d7c50751789fa1624259',

      location: `${cities[randomCity].city}, ${cities[randomCity].state}`,

      title: `${sample(descriptors)} ${sample(places)}`,

      description: 'A peaceful campsite surrounded by tall trees and fresh air. Perfect for relaxing and disconnecting from city life.',

      price,

      geometry: {
        type: "Point",
        coordinates: [
          cities[randomCity].longitude,
          cities[randomCity].latitude,
        ]
      },

      images: [
        {
          url: 'https://res.cloudinary.com/dslilo3zi/image/upload/v1781169014/YelpCamp/uy02qrmmlbwm1dggbszx.avif',
          filename: 'YelpCamp/uy02qrmmlbwm1dggbszx',

        },
        {
          url: 'https://res.cloudinary.com/dslilo3zi/image/upload/v1781169055/YelpCamp/hi4mbf72u1wtfqabf4ba.avif',

          filename: 'YelpCamp/hi4mbf72u1wtfqabf4ba',
        }
      ],
    });

    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});