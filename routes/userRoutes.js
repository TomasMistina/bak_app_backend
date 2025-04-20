const express = require('express');
const router = express.Router();
const User = require('../models/UserModel');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
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

router.post('/login', [body('username').isString().notEmpty(), body('password').isString().notEmpty()], async (req, res) =>{
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
            $set: {isDeleted: true, username: deletedUsername, email: deletedUsername},
        });
        res.status(200).json({ message: "User deleted successfully"})
    }catch(error){
        console.error("Error deleting user", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.patch('/change-password', [body('oldPassword').isString().notEmpty(), body('newPassword').isString().notEmpty()], async (req, res) =>{
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    const {userId, oldPassword, newPassword}= req.body;
    const user = await User.findById(userId);
    if(!user){
        return res.status(404).json({ message: "User not found" });
    }
    if (user.isDeleted) {
        return res.status(400).json({ message: "The user was deleted"});
    }
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid){
        return res.status(401).json({ message: "Old password was not valid" });
    }
    const saltPassword = await bcrypt.genSalt(10);
    const securePassword = await bcrypt.hash(newPassword, saltPassword);
    await User.findByIdAndUpdate(userId, {
        $set: {password: securePassword},
    });
    res.status(200).json({message: "Password successfully changed"})
})

router.patch('/change-username', [body('newUsername').isString().notEmpty(), body('password').isString().notEmpty()], async (req, res) =>{
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    const {userId, newUsername, password}= req.body;
    const user = await User.findById(userId);
    if(!user){
        return res.status(404).json({ message: "User not found" });
    }
    if (user.isDeleted) {
        return res.status(400).json({ message: "The user was deleted"});
    }
    const usernameInUse = await User.findOne({ username: newUsername });
    if(usernameInUse){
        return res.status(409).json({ message: "This username is already in use"});
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid){ 
        return res.status(401).json({ message: "Password was not valid" });
    }
    await User.findByIdAndUpdate(userId, {
        $set: {username: newUsername},
    });
    res.status(200).json({message: "Username successfully changed"})
})

router.patch('/change-email', [body('newEmail').isEmail(), body('password').isString().notEmpty()], async (req, res) =>{
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    const {userId, password, newEmail}= req.body;
    const user = await User.findById(userId);
    if(!user){
        return res.status(404).json({ message: "User not found" });
    }
    if (user.isDeleted) {
        return res.status(400).json({ message: "The user was deleted"});
    }
    const email = await User.findOne({ email: newEmail });
    if(email){
        return res.status(409).json({ message: "This email is already in use"});
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid){
        return res.status(401).json({ message: "Password was not valid" });
    }
    await User.findByIdAndUpdate(userId, {
        $set: {email: newEmail},
    });
    res.status(200).json({message: "Email successfully changed"})
})

router.post("/forgot-password", [body('email').isEmail()], async (req, res) => {
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

    const { email } = req.body;
  
    const user = await User.findOne({ email });
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User not found" });
    }
  
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  
    user.resetCode = resetCode;
    user.resetCodeExpires = Date.now() + 15 * 60 * 1000;  //15 min na reset
    await user.save();
  
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "pickyourstorynoreply@gmail.com",
        pass: "opxn pmxq tmib nunl"
      }
    });
  
    const mailOptions = {
      from: "pickyourstorynoreply@gmail.com",
      to: user.email,
      subject: "Kód na zmenu hesla",
      text: `Tvoj kód na zmenu hesla: ${resetCode}`
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to send email" });
      }
      res.status(200).json({ message: "Reset code sent to email" });
    });
  });

router.post("/validate-recovery-code", async (req, res) => {
    const { email, code} = req.body;
  
    const user = await User.findOne({ email });
  
    if (
      !user ||
      user.resetCode !== code ||
      Date.now() > user.resetCodeExpires
    ) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }
  
    res.status(200).json({ message: "Recovery code is valid" });
  });

router.post("/reset-password", async (req, res) => {
    const { email, code, newPassword } = req.body;
  
    const user = await User.findOne({ email });
  
    if (
      !user ||
      user.resetCode !== code
    ) {
      return res.status(400).json({ message: "Invalid reset code" });
    }

    const saltPassword = await bcrypt.genSalt(10);
    const securePassword = await bcrypt.hash(newPassword, saltPassword);
    user.password = securePassword;
    user.resetCode = null;
    user.resetCodeExpires = null;
    await user.save();
  
    res.status(200).json({ message: "Password has been reset" });
  });

router.get('/get-email', async (req, res) => {
    const user = await User.findById(req.query.userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    if (user.isDeleted){
        return res.status(404).json({ message: 'User was deleted' });
    }
  
    res.json({ email: user.email });
  });

module.exports = router;

