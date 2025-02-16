const express = require('express');
const router = express.Router();
const Lesson = require('../models/LessonModel');
const Group = require('../models/GroupModel');

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

router.get('/get-lesson/:id', async (req,res) =>{
    try{
        const lessonId = req.params.id;
        const lesson = await Lesson.findOne({ _id: lessonId}).populate();
        res.json({
            data: lesson
        })
    }catch (error){
        console.error("Error getting lesson:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;