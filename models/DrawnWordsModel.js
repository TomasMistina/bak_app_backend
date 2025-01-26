const mongoose = require('mongoose');

const drawItemSchema = new mongoose.Schema({
    id: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    isDone: {
      type: Boolean,
      required: true
    },
  });

const drawnItems = new mongoose.Schema({
    ownerName: {
        type: String,
        required: true
      },
    originHatTitle: {
        type: String,
        required: true
      },
    items: [drawItemSchema],
    date:{
        type: Date,
        default:Date.now
      }
  });


const DrawnItems = mongoose.model('DrawnItem', drawnItems);

module.exports = DrawnItems;