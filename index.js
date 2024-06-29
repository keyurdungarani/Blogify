import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { userRouter } from './routes/user.js'
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { checkForAuthenticationCookie } from './middlewares/authentication.js';
import { blogRoutes } from './routes/blog.js';
import { Blog } from './models/blog.js';


dotenv.config();

mongoose.connect(process.env.MONGOURL).then(()=> console.log("MongoDB connected successfully🫡")).catch((err)=> console.log("mDB connection err: ",err))

const app = express();
const PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

app.use(cookieParser());
app.use(express.urlencoded({extended: false}));
app.use(express.json({extended: false}));
app.use(checkForAuthenticationCookie('token'));
app.use(express.static(path.resolve('./public')));
app.use(express.static(path.resolve('./public/images')));

app.use('/user', userRouter);
app.use('/blog', blogRoutes); 

app.get('/', async (req,res)=> {
  console.log("🚀 ~ app.get ~ req.user:", req.user);
  if(!req.user) { return res.redirect('/user/signin')};
  const allBlog = await Blog.find({createdBy: req.user._id});
  console.log("🚀 ~ app.get ~ allBlog:", allBlog);
  
  return res.render('home', { user: req.user, allBlog }); 
});
 

app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`));