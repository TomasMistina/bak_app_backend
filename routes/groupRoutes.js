const express = require('express');
const router = express.Router();
const Group = require('../models/GroupModel');
const User = require('../models/UserModel');

router.post('/join', async (req, res) => {
    try {
        const { accessCode } = req.body;
        const userId = req.user.id;

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

module.exports = router;