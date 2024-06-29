import mongoose, { model } from "mongoose";
import {createHmac, randomBytes} from 'node:crypto';
import { createTokenForUser } from "../services/authentication.js";

const userSchema = new mongoose.Schema({
    fullName:{
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    salt: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    profileImageURL: {
        type: String,
        required: true,
        default: '/images/user.png'
    },
    role: {
        type: String,
        enum: ['USER','ADMIN'],
        default: 'USER',
    }
},{timestamps: true});

userSchema.pre('save', function(next){
    const user = this;
    if(!user.isModified('password')) return null;

    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac('sha256', salt).update(user.password).digest('hex');

    this.salt = salt;
    this.password = hashedPassword;
    next();
});

userSchema.static('matchPasswordAndGenerateToken', async function(email,password){
    const user = await this.findOne({email});
    if(!user) throw new Error('User not found!');

    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac('sha256',salt).update(password).digest('hex');
    if(userProvidedHash !== hashedPassword) throw new Error('Incorrect password');

    const token = createTokenForUser(user);
    return token;
});

const User = model('User', userSchema);

export default User;