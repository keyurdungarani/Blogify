import { Router } from "express";
import multer from "multer";
import path from "path";
import { Blog } from "../models/blog.js";
import { Comment } from "../models/comment.js";


const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve('./public/uploads'));
    },
    filename: function (req, file, cb) {
      const uniqueSuffix =  new Date().getTime().toString();
      console.log("🚀 ~ uniqueSuffix:", uniqueSuffix)
      cb(null, uniqueSuffix + '-' + file.originalname );
    }
  });

const upload = multer({storage: storage});

router.get('/add-blog', (req,res)=> {
    res.render('addBlog', {user: req.user});
}); 

router.post('/', upload.single('coverImage'), async (req,res)=> {
    // console.log("🚀 ~ router.post ~ req.body:", req.body);
    // console.log("🚀 ~ router.post ~ req.user:", req.user);
    // console.log("🚀 ~ router.post ~ req.file:", req.file);

    const {title, body} = req.body;
    const blog = await Blog.create({
      title,
      body,
      createdBy: req.user._id,
      coverImageURL: `/uploads/${req.file.filename}`,
    });
    return res.redirect(`/blog/${blog._id}`);
}); 
  
router.get('/:id', async (req,res)=>{
  const id = req.params.id; 
  const allBlog = await Blog.findById(id).populate('createdBy');
  // console.log("🚀 ~ router.get ~ allBlog:", allBlog);
  
  const comments = await Comment.find({blogId: id}).populate('createdBy');
  // console.log("🚀 ~ router.get ~ comments:", comments);
   
  // console.log('/blog/:id/ req.user: ', req.user);
  return res.render('indiBlog',{blog: allBlog, comments, user: req.user});
});

router.post('/comment/:blogId', async(req,res)=>{
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

//handle delete blog
router.post('/delete/:id', async (req, res) => {
  if (!req.user) { 
    return res.redirect('/user/signin');
  }

  try {
    await Blog.deleteOne({ _id: req.params.id, createdBy: req.user._id });
    res.redirect('/');
  } catch (err) {
    console.error("Failed to delete the blog post:", err);
    res.status(500).send("Failed to delete the blog post.");
  }
});

export { router as blogRoutes };