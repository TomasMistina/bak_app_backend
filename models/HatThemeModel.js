const mongoose = require('mongoose');

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
  ownerName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  hats: [hatSchema],
  date:{
    type: Date,
    default:Date.now
  }
});

const HatTheme = mongoose.model('HatTheme', hatThemeSchema);

module.exports = HatTheme;
