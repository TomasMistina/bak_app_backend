const mongoose = require('mongoose');
const User = require('./UserModel');

const groupSchema = new mongoose.Schema({
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    groupName:{
        type: String,
        required: true,
    },
    accessCode:{
        type: String,
        required: true,
        unique: true,
    },
    lessons: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson" 
    }],
    participants: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    isDeleted:{
        type: Boolean,
        default: false,
    },
  });

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;