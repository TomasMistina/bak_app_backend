const mongoose = require('mongoose');
const LessonHatTheme = require('./LessonHatThemeModel');

const lessonSchema = new mongoose.Schema({
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    lessonName: {
        type: String,
        required: true,
    },
    lessonHatThemes: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: "LessonHatTheme" 
    }],
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