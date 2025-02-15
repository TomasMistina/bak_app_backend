const mongoose = require('mongoose');
const User = require('./UserModel');

const itemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
});

const hatSchema = new mongoose.Schema({
  items: [itemSchema]
});

const hatThemeSchema = new mongoose.Schema({
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  title: {
    type: String,
    required: true
  },
  hats: [hatSchema],
  date: {
    type: Date,
    default: Date.now
  },
  isPublic: { 
    type: Boolean, 
    default: true 
  },
  isDeleted: { 
    type: Boolean, 
    default: false 
  },
  wasCopied: { 
    type: Boolean, 
    default: false 
  },
  copiedFrom: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "HatTheme", 
    default: null 
  }
});

const HatTheme = mongoose.model('HatTheme', hatThemeSchema);

module.exports = HatTheme;
