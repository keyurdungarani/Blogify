import express from 'express';
import User from '../models/user.js';
import createHmac from 'node:crypto';
import crypto from 'crypto';


const router = express.Router();

router.get('/signup', (req,res)=>{
    return res.render('signup', {user: req.user});
});

router.get('/signin', (req,res)=>{
    return res.render('signin', {user: req.user});
});

router.get('/logout', (req,res)=>{
    res.clearCookie('token').redirect('/');
});

router.post('/signup', async (req,res)=>{
    const {fullName, email, password} = req?.body;

    await User.create({
        fullName: fullName,
        email: email,
        password: password,
    });
    return res.redirect('/user/signin');
}); 

router.post('/signin', async (req,res)=>{
    const {email, password} = req?.body;
    try {
        const token = await User.matchPasswordAndGenerateToken(email, password);
        console.log("🚀 ~ router.post ~ token:", token);
        if(!token) return false;
        return res.cookie('token', token).redirect('/'); 
    } catch (error) {
        return res.render('signin',{
            error: 'Incorrect email or password'
        });
    }
}); 



export {router as userRouter};