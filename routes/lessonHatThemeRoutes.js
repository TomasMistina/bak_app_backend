const express = require('express');
const router = express.Router();
const LessonHatTheme = require('../models/LessonHatThemeModel');
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
            hatTheme: hatThemeId,
            fromLesson: lessonId,
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
        if (!lessonHatTheme) {
            return res.status(404).json({ message: "LessonHatTheme not found" });
        }
        if (lessonHatTheme.isDeleted) {
            return res.status(400).json({ message: "The lessonHatTheme was deleted"});
        }
        res.json({
            data: lessonHatTheme
        })
    }catch (error){
        console.error("Error getting lessonHatTheme:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.patch('/delete/:id', async (req, res) => {
    try{
        const lessonHatThemeId = req.params.id;
        const lessonHatTheme = await LessonHatTheme.findById(lessonHatThemeId).lean();
        if (!lessonHatTheme) {
            return res.status(404).json({ message: "LessonHatTheme not found" });
        }

        if (lessonHatTheme.isDeleted) {
            return res.status(400).json({ message: "The LessonHatTheme was already deleted"});
        }

        await LessonHatTheme.findByIdAndUpdate(lessonHatThemeId, {
            $set: {isDeleted: true}
        });
        res.status(200).json({ message: "LessonHatTheme deleted successfully"})
    }catch(error){
        console.error("Error deleting lessonHatTheme", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.patch('/lock/:id', async (req, res) => {
    try{
        const lessonHatThemeId = req.params.id;
        const lessonHatTheme = await LessonHatTheme.findById(lessonHatThemeId).lean();
        if (!lessonHatTheme) {
            return res.status(404).json({ message: "LessonHatTheme not found" });
        }

        if (lessonHatTheme.isDeleted) {
            return res.status(400).json({ message: "The LessonHatTheme was deleted"});
        }

        if (!lessonHatTheme.isOpen) {
            return res.status(400).json({ message: "The LessonHatTheme is already closed"});
        }

        await LessonHatTheme.findByIdAndUpdate(lessonHatThemeId, {
            $set: {isOpen: false}
        });
        res.status(200).json({ message: "LessonHatTheme closed successfully"})
    }catch(error){
        console.error("Error closing lessonHatTheme", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.patch('/unlock/:id', async (req, res) => {
    try{
        const lessonHatThemeId = req.params.id;
        const lessonHatTheme = await LessonHatTheme.findById(lessonHatThemeId).lean();
        if (!lessonHatTheme) {
            return res.status(404).json({ message: "LessonHatTheme not found" });
        }

        if (lessonHatTheme.isDeleted) {
            return res.status(400).json({ message: "The LessonHatTheme was deleted"});
        }

        if (lessonHatTheme.isOpen) {
            return res.status(400).json({ message: "The LessonHatTheme is already open"});
        }
        
        const lesson = await Lesson.findById(lessonHatTheme.fromLesson)

        if (!lesson) {
            return res.status(404).json({ message: "Associated Lesson not found" });
        }

        if(!lesson.isOpen){
            return res.status(400).json({ message: "You cannot open a LessonHatTheme in closed Lesson" })
        }

        await LessonHatTheme.findByIdAndUpdate(lessonHatThemeId, {
            $set: {isOpen: true}
        });
        res.status(200).json({ message: "LessonHatTheme opened successfully"})
    }catch(error){
        console.error("Error opening lessonHatTheme", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;