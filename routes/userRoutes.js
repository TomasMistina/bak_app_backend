const express = require('express');
const router = express.Router();
const User = require('../models/UserModel');
const bcrypt = require('bcrypt');
const {body, validationResult}  = require('express-validator');

router.post('/register', [body('username').isString().notEmpty(), body('email').isEmail(), body('password').isString().notEmpty()], async (req, res) =>{
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    const user = await User.findOne({ username: req.body.username });
    const email = await User.findOne({ email: req.body.email });
    if (user){
        res.status(409).send("This username is already taken");
    }else if(email){
        res.status(409).send("This email is already in use");
    }else{
        const saltPassword = await bcrypt.genSalt(10)
        const securePassword = await bcrypt.hash(req.body.password, saltPassword)
        const signedUpUser = new User({
            username:req.body.username,
            email:req.body.email,
            password:securePassword
        })
        signedUpUser.save().then(data=>{
            res.status(201).json({message: "Registered", data})
        }).catch(error =>{
            console.error("Error registering user", error);
            res.status(500).json({ message: "Server error" })
        })
    }
})

router.post('/login', [body('username').isString().notEmpty(), body('email').isEmail(), body('password').isString().notEmpty()], async (req, res) =>{
    const user = await User.findOne({ username: req.body.username });
    if (user) {
        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        if (isPasswordValid) {
            res.status(200).json({ message: "Logged in", data: user._id });
        } else {
            res.status(401).json({ message: "Passwords do not match" });
        }
    } else {
        res.status(404).json({ message: "User not found" });
    }
    })

router.patch('/delete/:id', async (req, res) =>{
    try{
        const userId = req.params.id;
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({ message: "User not found" });
        }
        if (user.isDeleted) {
            return res.status(400).json({ message: "The user was already deleted"});
        }
        const deletedUsername = `deleted_${userId}`;
        await User.findByIdAndUpdate(userId, {
            $set: {isDeleted: true, username: deletedUsername},
        });
        res.status(200).json({ message: "User deleted successfully"})
    }catch(error){
        console.error("Error deleting user", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;




