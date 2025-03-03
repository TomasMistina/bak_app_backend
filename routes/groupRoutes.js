const express = require('express');
const router = express.Router();
const Group = require('../models/GroupModel');
const User = require('../models/UserModel');
const Lesson = require('../models/LessonModel');
const {PAGE_LIMIT} = require('../constants');

router.post('/join', async (req, res) => {
    try {
        const { userId, accessCode } = req.body;
        //const userId = req.user.id;

        const group = await Group.findOne({ accessCode });

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }
        if (group.isDeleted){
            return res.status(400).json({ message: "Cannot join the group anymore, the group has been deleted."})
        }

        await Group.findByIdAndUpdate(
            group._id,
            { $addToSet: { participants: userId } },
            { new: true }
        );

        res.status(200).json({ message: "Successfully joined group", groupId: group._id });
    } catch (error) {
        console.error("Error joining group:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post('/create', async (req, res) => {
    try{
        //const user = req.user.id;
        const {userId, groupName, accessCode} = req.body;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const existingAccessCode= await Group.findOne({ accessCode });
        if (existingAccessCode){
            return res.status(409).send("This Access Code already exists");
        }else{
            const newGroup = new Group({
                owner: userId,
                groupName: groupName,
                accessCode: accessCode,
                lessons: [],
                participants: [],
            });
            await newGroup.save();
            res.status(201).send("Group created sucessfully");
        }

    }catch (error){
        console.error("Error creating group:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/mentored-groups', async (req, res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = PAGE_LIMIT;
        const skipCount = (page - 1) * limit;
        const {userId} = req.query;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const user = await User.findById({ _id: userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const mentoredGroups = await Group.find({ owner: userId, isDeleted: false}).sort({ createdAt: -1 }).skip(skipCount).limit(limit);
        const totalItems = await Group.countDocuments({ owner: userId, isDeleted: false });
        const totalPages = Math.ceil(totalItems / limit);
        res.json({
            data: mentoredGroups,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        })
    }catch (error){
        console.error("Error fetching mentored groups:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/participant-groups', async (req, res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = PAGE_LIMIT;
        const skipCount = (page - 1) * limit;
        const {userId} = req.query;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const user = await User.findById({ _id: userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const participantGroups = await Group.find({ participants: userId, isDeleted: false }).sort({ createdAt: -1 }).skip(skipCount).limit(limit);
        const totalItems = await Group.countDocuments({ participants: userId, isDeleted: false });
        const totalPages = Math.ceil(totalItems / limit);
        res.json({
            data: participantGroups,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        })
    }catch (error){
        console.error("Error fetching participant groups:", error);
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

        const lessons = await Lesson.find({ _id: { $in: group.lessons || [] }, isDeleted: false }).sort({ createdAt: -1 }).skip(skipCount).limit(limit);
        const totalItems = await Lesson.countDocuments({ _id: { $in: group.lessons || [] }, isDeleted: false });
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
        const groupId = req.params.id;
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (group.isDeleted) {
            return res.status(400).json({ message: "The group was already deleted"});
        }

        await Group.findByIdAndUpdate(groupId, { $set: { isDeleted: true } });

        const lessonIds = group.lessons || [];

        if (lessonIds.length > 0){
            await Lesson.updateMany(
                { _id: { $in: lessonIds } }, 
                { $set: { isDeleted: true } }
            );
            await LessonHatTheme.updateMany(
                { lesson: { $in: lessonIds } },
                { $set: { isDeleted: true } }
            );
        }

        res.status(200).json({ message: "Group deleted successfully"})
    }catch(error){
        console.error("Error deleting group", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;