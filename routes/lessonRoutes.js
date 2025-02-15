const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson'); // Import Lesson model
const Group = require('../models/Group'); // Import Group model

// Create a new lesson and add it to a group
router.post('/create', async (req, res) => {
    try {
        const { groupId, lessonName } = req.body;

        // Check if the Group exists
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Create a new lesson
        const newLesson = new Lesson({
            name: lessonName,
            group: groupId // Assuming Lesson schema has a reference to Group
        });

        // Save the lesson
        const savedLesson = await newLesson.save();

        // Add the lesson to the group's lessons array
        await Group.findByIdAndUpdate(groupId, {
            $push: { lessons: savedLesson._id }
        });

        res.status(201).json({ message: "Lesson created and added to group", lesson: savedLesson });
    } catch (error) {
        console.error("Error creating lesson:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;