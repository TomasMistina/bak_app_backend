const express = require('express');
const router = express.Router();
const Group = require('../models/GroupModel');
const User = require('../models/UserModel');

router.post('/join', async (req, res) => {
    try {
        const { userId, accessCode } = req.body;
        //const userId = req.user.id;

        const group = await Group.findOne({ accessCode });

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
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

//TODO pridat paging
router.get('/mentored-groups', async (req, res) => {
    try{
        const {userId} = req.body;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const mentoredGroups = await Group.find({ owner: userId })/*.populate('lessons').exec()*/;
        res.json({
            data: mentoredGroups
        })
    }catch (error){
        console.error("Error fetching mentored groups:", error);
        res.status(500).json({ message: "Server error" });
    }
});

//TODO pridat paging
router.get('/participant-groups', async (req, res) => {
    try{
        const {userId} = req.body;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const participantGroups = await Group.find({ participants: userId })/*.populate('lessons').exec()*/;
        res.json({
            data: participantGroups
        })
    }catch (error){
        console.error("Error fetching participant groups:", error);
        res.status(500).json({ message: "Server error" });
    }
});

//TODO fixnut stav ked sa posle zle ID
router.get('/get-group/:id', async (req, res) =>{
    try{
        const groupId = req.params.id;
        const group = await Group.findOne({ _id: groupId}).populate();
        res.json({
            data: group
        })
    }catch{
        console.error("Error fetching group:", error);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;