const mongoose = require('mongoose')

const signUpTemplate = new mongoose.Schema({
    username:{
        type: String,
        required:true,
        unique: true
    },
    email:{
        type: String,
        required:true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        default:Date.now
    },
    isDeleted:{
        type: Boolean,
        default: false,
    },
    resetCode:{
        type: String,
        default: null,
    },
    resetCodeExpires:{
        type: Date,
        default: null,
    }
});

const User = mongoose.model('User', signUpTemplate);

module.exports = User;