const express = require('express');
const router = express.Router();
const Lesson = require('../models/LessonModel');
const Group = require('../models/GroupModel');
const LessonHatTheme = require('../models/LessonHatThemeModel');
const {PAGE_LIMIT} = require('../constants');

router.post('/create', async (req, res) => {
    try {
        const { groupId, lessonName, userId} = req.body;
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const newLesson = new Lesson({
            lessonName: lessonName,
            owner: userId
        });

        const savedLesson = await newLesson.save();
        await Group.findByIdAndUpdate(groupId, {
            $push: { lessons: savedLesson._id }
        });

        res.status(201).json({ message: "Lesson created and added to group", lesson: savedLesson });
    } catch (error) {
        console.error("Error creating lesson:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/get-lesson/:id', async (req, res) =>{
    try{
        const lessonId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const limit = PAGE_LIMIT;
        const skipCount = (page - 1) * limit;
        const lesson = await Lesson.findById(lessonId).lean();
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }
        if (lesson.isDeleted) {
            return res.status(400).json({ message: "The lesson was deleted"});
        }

        const lessonHatThemes = await LessonHatTheme.find({ _id: { $in: lesson.lessonHatThemes || []}, isDeleted: false }).sort({ createdAt: -1 }).skip(skipCount).limit(limit);
        const totalItems = await LessonHatTheme.countDocuments({ _id: { $in: lesson.lessonHatThemes || []}, isDeleted: false });
        const totalPages = Math.ceil(totalItems / limit);

        res.json({
            lesson,
            lessonHatThemes,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        })

    }catch (error){
        console.error("Error getting lesson:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/get-group/:id', async (req, res) =>{
    try{
        const groupId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const limit = PAGE_LIMIT;
        const skipCount = (page - 1) * limit;
        const group = await Group.findById(groupId).lean();
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (group.isDeleted) {
            return res.status(400).json({ message: "The group was deleted"});
        }

        const lessons = await Lesson.find({ _id: { $in: group.lessons }, isDeleted: false }).sort({ createdAt: -1 }).skip(skipCount).limit(limit);
        const totalItems = await Lesson.countDocuments({ _id: { $in: group.lessons }, isDeleted: false });
        const totalPages = Math.ceil(totalItems / limit);

        res.json({
            group,
            lessons,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        })
    }catch(error){
        console.error("Error fetching group:", error);
        res.status(500).json({ message: "Server error" });
    }
});

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

        if (lesson.lessonHatThemes && lesson.lessonHatThemes.length > 0) {
            await LessonHatTheme.updateMany(
                { _id: { $in: lesson.lessonHatThemes } }, 
                { $set: { isDeleted: true } }
            );
        }

        res.status(200).json({ message: "Lesson deleted successfully"})
    }catch(error){
        console.error("Error deleting lesson", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.patch('/lock/:id', async (req, res) => {
    try{
        const lessonId = req.params.id;
        const lesson = await Lesson.findById(lessonId).lean();
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }

        if (lesson.isDeleted) {
            return res.status(400).json({ message: "The lesson was deleted"});
        }

        if (!lesson.isOpen){
            return res.status(400).json({ message: "The lesson was already closed"});
        
        }
        await Lesson.findByIdAndUpdate(lessonId, {
            $set: {isOpen: false}
        });

        if (lesson.lessonHatThemes && lesson.lessonHatThemes.length > 0) {
            await LessonHatTheme.updateMany(
                { _id: { $in: lesson.lessonHatThemes } }, 
                { $set: { isOpen: false } }
            );
        }

        res.status(200).json({ message: "Lesson closed successfully"})
    }catch(error){
        console.error("Error closing lesson", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.patch('/unlock/:id', async (req, res) => {
    try{
        const lessonId = req.params.id;
        const lesson = await Lesson.findById(lessonId).lean();
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }

        if (lesson.isDeleted) {
            return res.status(400).json({ message: "The lesson was deleted" });
        }

        if (lesson.isOpen){
            return res.status(400).json({ message: "The lesson was already open" })
        }

        await Lesson.findByIdAndUpdate(lessonId, {
            $set: {isOpen: true}
        });

        if (lesson.lessonHatThemes && lesson.lessonHatThemes.length > 0) {
            await LessonHatTheme.updateMany(
                { _id: { $in: lesson.lessonHatThemes } }, 
                { $set: { isOpen: true } }
            );
        }

        res.status(200).json({ message: "Lesson open successfully"})
    }catch(error){
        console.error("Error opening lesson", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;