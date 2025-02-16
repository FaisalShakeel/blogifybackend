const express=require('express')
const { addBlog } = require('../Controllers/BlogController')
const { verifyUser } = require('../Middlewares/VerifyUser')
const blogRouter=express.Router()
blogRouter.post("/create-blog",verifyUser,addBlog)
module.exports = blogRouter