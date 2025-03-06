const express=require('express')
const { addBlog, getBlogById, likeBlog, addComment, replyToComment, getBlogsByTag, findByIdAndUpdateBlog, deleteBlog } = require('../Controllers/BlogController')
const { verifyUser } = require('../Middlewares/VerifyUser')
const blogRouter=express.Router()
blogRouter.post("/create-blog",verifyUser,addBlog),
blogRouter.get("/blog-detail/:blogId",getBlogById)
blogRouter.put("/like-blog",verifyUser,likeBlog)
blogRouter.post("/add-comment",verifyUser,addComment)
blogRouter.put("/reply-to-comment",verifyUser,replyToComment)
blogRouter.get("/find-by-tag/:tag",getBlogsByTag)
blogRouter.put("/update-blog/:blogId",verifyUser,findByIdAndUpdateBlog)
blogRouter.delete("/delete-blog/:blogId",verifyUser,deleteBlog)
module.exports = blogRouter