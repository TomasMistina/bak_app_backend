const express = require('express');
const router = express.Router();
const Lesson = require('../models/LessonModel');
const Group = require('../models/GroupModel');
const HatTheme = require('../models/HatThemeModel');
const DrawnItems = require('../models/DrawnWordsModel');

router.post('/create', async (req, res) => {
    try {
        const { groupId, lessonName, hatThemeId, userId} = req.body;
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const hatTheme = await HatTheme.findById(hatThemeId);
        if (!hatTheme) {
            return res.status(404).json({ message: "HatTheme not found" });
        }

        const newLesson = new Lesson({
            lessonName: lessonName,
            owner: userId,
            hatTheme: hatThemeId,
        });

        const savedLesson = await newLesson.save();
        await Group.findByIdAndUpdate(groupId, {
            $push: { lessons: savedLesson._id }
        });

        res.status(201).json({ message: "Lesson created and added to group", data: savedLesson });
    } catch (error) {
        console.error("Error creating lesson:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/get-lesson/:id', async (req, res) =>{
    try{
        const lessonId = req.params.id;
        const lesson = await Lesson.findById(lessonId).lean();
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }
        if (lesson.isDeleted) {
            return res.status(400).json({ message: "The lesson was deleted"});
        }

        const lessonHatTheme = await HatTheme.findById(lesson.hatTheme);

        res.json({
            lesson,
            lessonHatTheme
        })

    }catch (error){
        console.error("Error getting lesson:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/get-drawn-words/all/:id', async (req, res) =>{
    try{
        const lessonId = req.params.id;
        const lesson = await Lesson.findById(lessonId).lean();
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }
        if (lesson.isDeleted) {
            return res.status(400).json({ message: "The lesson was deleted"});
        }

        const drawnWordsLists = await DrawnItems.find({ lessonHatTheme: lessonId, isDeleted: false}).sort({ createdAt: -1 }).populate('owner','username').lean();

        res.json({
            drawnWordsLists
        })

    }catch (error){
        console.error("Error getting drawn words", error);
        res.status(500).json({ message: "Server error" });
    }
})

router.get('/get-drawn-words/mine/:id', async (req, res) =>{
    try{
        const lessonId = req.params.id;
        const userId = req.query.userId;
        const lesson = await Lesson.findById(lessonId).lean();
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }
        if (lesson.isDeleted) {
            return res.status(400).json({ message: "The lesson was deleted"});
        }

        const drawnWordsLists = await DrawnItems.find({ lessonHatTheme: lessonId, owner: userId, isDeleted: false}).sort({ createdAt: -1 }).populate('owner','username').lean();
        
        res.json({
            drawnWordsLists
        })

    }catch (error){
        console.error("Error getting drawn words", error);
        res.status(500).json({ message: "Server error" });
    }
})

router.patch('/delete/:id', async (req, res) => {
    try{
        const lessonId = req.params.id;
        const lesson = await Lesson.findById(lessonId).lean();
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }

        if (lesson.isDeleted) {
            return res.status(400).json({ message: "The lesson was already deleted"});
        }

        await Lesson.findByIdAndUpdate(lessonId, {
            $set: {isDeleted: true}
        });

        // if (lesson.lessonHatThemes && lesson.lessonHatThemes.length > 0) {
        //     await LessonHatTheme.updateMany(
        //         { _id: { $in: lesson.lessonHatThemes } }, 
        //         { $set: { isDeleted: true } }
        //     );
        // }

        res.status(200).json({ message: "Lesson deleted successfully"})
    }catch(error){
        console.error("Error deleting lesson", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.patch('/toggle-lock/:id', async (req, res) => {
    try {
        const lessonId = req.params.id;
        const lesson = await Lesson.findById(lessonId).lean();
        
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }

        if (lesson.isDeleted) {
            return res.status(400).json({ message: "The lesson was deleted" });
        }

        const updatedLesson = await Lesson.findByIdAndUpdate(lessonId, {
            $set: { isOpen: !lesson.isOpen }
        }, { new: true });

        res.status(200).json({ 
            message: updatedLesson.isOpen ? "Lesson opened successfully" : "Lesson closed successfully"
        });

    } catch (error) {
        console.error("Error toggling lesson lock", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;