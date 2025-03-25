const mongoose = require('mongoose');
const HatTheme = require('./HatThemeModel');

const lessonSchema = new mongoose.Schema({
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    description: {
        type: String,
        trim: true,
    },
    lessonName: {
        type: String,
        required: true,
    },
    hatTheme: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HatTheme",
        required: true,
    },
    isOpen: {
        type: Boolean,
        default: true,
    },
    timeOfClosure: {
        type: Date,
        default: null,
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

 const Lesson = mongoose.model('Lesson', lessonSchema);

 module.exports = Lesson;