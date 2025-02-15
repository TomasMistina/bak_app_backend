const express = require('express')
const router = express.Router()
const signUpTemplateCopy = require('../models/UserModel')
const bcrypt = require('bcrypt')
const {body, validationResult}  = require('express-validator')

router.post('/register', [body('username').isString().notEmpty(), body('email').isEmail(), body('password').isString().notEmpty()], async (req, res) =>{
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    const user = await signUpTemplateCopy.findOne({ username: req.body.username });
    const email = await signUpTemplateCopy.findOne({ email: req.body.email });
    if (user){
        res.status(409).send("This username is already taken");
    }else if(email){
        res.status(409).send("This email is already in use");
    }else{
        const saltPassword = await bcrypt.genSalt(10)
        const securePassword = await bcrypt.hash(req.body.password, saltPassword)
        const signedUpUser = new signUpTemplateCopy({
            username:req.body.username,
            email:req.body.email,
            password:securePassword
        })
        signedUpUser.save().then(data=>{
            res.json(data)
        }).catch(error =>{
            res.json(error)
        })
    }
})


router.post('/login', [body('username').isString().notEmpty(), body('email').isEmail(), body('password').isString().notEmpty()], async (req, res) =>{
    const user = await signUpTemplateCopy.findOne({ username: req.body.username });
    if (user) {
        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        if (isPasswordValid) {
            res.status(200).send("Logged in");
        } else {
            res.status(401).send("Passwords do not match");
        }
    } else {
        res.status(404).send("User not found");
    }
    })

module.exports = router




