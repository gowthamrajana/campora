const express = require('express');
const app = express();
const path = require('path')
const cities = require('./cities');
const {descriptors,places} = require('./seedHelpers');
const mongoose = require('mongoose');
const Campground =require('../models/campground');

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

const sample = array =>array[Math.floor(Math.random() * array.length)];//

const seedDB = async() => {
  await Campground.deleteMany({});
 for(let i=0;i<50;i++){
  const price = Math.floor(Math.random()*30) + 10;
  const random1000 = Math.floor(Math.random()*1000);
  const camp = new Campground({
    location: `${cities[random1000].city}, ${cities[random1000].state}`,
    title: `${sample(descriptors)} ${sample(places)}`,
    image: `https://picsum.photos/400?random=${Math.random()}`,
    description: 'A peaceful campsite surrounded by tall trees and fresh mountain air. Perfect for relaxing and disconnecting from city life.',
    price
  })
await camp.save();
 }
}

seedDB().then(()=>{
  mongoose.connection.close();
})