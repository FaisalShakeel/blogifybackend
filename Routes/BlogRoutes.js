const express=require('express')
const { addBlog, getBlogById, likeBlog, addComment, replyToComment } = require('../Controllers/BlogController')
const { verifyUser } = require('../Middlewares/VerifyUser')
const blogRouter=express.Router()
blogRouter.post("/create-blog",verifyUser,addBlog),
blogRouter.get("/blog-detail/:blogId",getBlogById)
blogRouter.put("/like-blog",verifyUser,likeBlog)
blogRouter.post("/add-comment",verifyUser,addComment)
blogRouter.put("/reply-to-comment",verifyUser,replyToComment)
module.exports = blogRouter