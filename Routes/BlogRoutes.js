const express=require('express')
const { addBlog, getBlogById } = require('../Controllers/BlogController')
const { verifyUser } = require('../Middlewares/VerifyUser')
const blogRouter=express.Router()
blogRouter.post("/create-blog",verifyUser,addBlog),
blogRouter.get("/blog-detail/:blogId",getBlogById)
module.exports = blogRouter