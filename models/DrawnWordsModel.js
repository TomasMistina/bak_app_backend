const mongoose = require('mongoose');
const User = require('./UserModel');
const HatTheme = require('./HatThemeModel');
const LessonHatTheme = require('./LessonHatThemeModel');

const drawItemSchema = new mongoose.Schema({
    id: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
  });

const drawnItems = new mongoose.Schema({
    owner: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    originHatTheme:{
      type: mongoose.Schema.Types.ObjectId, 
      ref: "HatTheme",
      required: true,
    },
    lessonHatTheme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LessonHatTheme",
      default: null
    },
    items: [drawItemSchema],
    date:{
      type: Date,
      default:Date.now
    },
    isFromLesson:{
      type: Boolean,
      default: false
    },
    isDeleted:{
      type: Boolean,
      default: false,
    },
  });


const DrawnItems = mongoose.model('DrawnItem', drawnItems);

module.exports = DrawnItems;