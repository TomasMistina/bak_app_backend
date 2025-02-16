const express = require('express');
const router = express.Router();
const LessonHatTheme = require('../models/LessonHatThemeModel')
const Lesson = require('../models/LessonModel');

router.post('/create', async (req, res) => {
    try {
        const { lessonId, hatThemeId, description, userId } = req.body;
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }

        const newLessonHatTheme = new LessonHatTheme({
            owner: userId,
            description: description,
            hatTheme: hatThemeId
        });
        
        const savedLessonHatTheme = await newLessonHatTheme.save();
        await Lesson.findByIdAndUpdate(lessonId, {
            $push: { lessonHatThemes: savedLessonHatTheme._id }
        });

        res.status(201).json({ message: "LessonHatTheme created and added to lesson", lessonHatTheme: savedLessonHatTheme });
    } catch (error) {
        console.error("Error creating lessonHatTheme:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/get-lessonHT/:id', async (req,res) =>{
    try{
        const lessonHatThemeId = req.params.id;
        const lessonHatTheme = await LessonHatTheme.findOne({ _id: lessonHatThemeId}).populate();
        res.json({
            data: lessonHatTheme
        })
    }catch (error){
        console.error("Error getting lessonHatTheme:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;