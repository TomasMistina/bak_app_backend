const mongoose = require('mongoose');
const HatTheme = require('./HatThemeModel');

const lessonHatThemeSchema = new mongoose.Schema({
    owner: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    description: {
      type: String,
      trim: true,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    timeOfClosure: {
      type: Date,
      default: null,
    },
    hatTheme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HatTheme",
      required: true,
    },
    fromLesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    isDeleted:{
      type: Boolean,
      default: false,
    },
    createdAt:{
      type: Date,
      default: Date.now()
    },
    lastChangedAt:{
        type: Date,
        default: Date.now()
    }
  });
  
  const LessonHatTheme = mongoose.model('LessonHatTheme', lessonHatThemeSchema);

  module.exports = LessonHatTheme;
