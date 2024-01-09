const express = require('express');
const router  = express.Router();
const User = require('../models/User');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const user_jwt = require('../middleware/user_jwt');

router.get('/', user_jwt, async(req, res, next) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        
        if(!user){
            return res.status(400).json({
                success: false,
                msg: 'User not exists go & register to continue.'
            });
        }

        return res.status(200).json({
            success: true,
            user: user
        });

    } catch(err){
        console.log(err.message);
        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
        next();
    }   
});

router.post('/register', async(req, res, next) =>{
    const {userName, email, password} = req.body;

    try{
        let user_exist = await User.findOne({email: email});
        
        if(user_exist){
            return res.json({
                success: false,
                msg: 'User already exist'
            });
        }

        let user = new User();
        
        user.userName = userName;
        user.email = email;

        const salt = await bcryptjs.genSalt(10);
        user.password = await bcryptjs.hash(password, salt);
        
        await user.save();
        
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, process.env.jwtUserSecret, {
            expiresIn: 360000
        }, (err, token) => {
            if(err) throw err;
            return res.status(200).json({
                success: true,
                token: token
            });
        });
    } catch(err){
        console.log(err.message);

        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
        next();
    }
});

router.post('/login', async(req, res, next) => {
    const email = req.body.email; 
    const password = req.body.password;

    try{
        let user = await User.findOne({email: email});
      
        if(!user){
            return res.status(400).json({
                success: false,
                msg: 'User not exists go & register to continue.'
            });
        }

        let isMatch = await bcryptjs.compare(password, user.password);
        
        if(!isMatch){
            return res.status(400).json({
                success: false,
                msg: 'Invalid Password'
            });
        }

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, process.env.jwtUserSecret, {
            expiresIn: 360000
        }, (err, token) => {
            if(err) throw err;
            
            return res.status(200).json({
                success: true,
                msg: 'User logged in',
                token: token,
                user: user
            });
        });
    } catch(err){
        console.log(err.message);

        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
        next();
    }
});

module.exports = router;