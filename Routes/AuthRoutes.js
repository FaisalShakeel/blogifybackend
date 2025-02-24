const express=require('express')
const { getDecodedUser, logout } = require('../Controllers/AuthController')
const { verifyUser } = require('../Middlewares/VerifyUser')
const authRouter=express.Router()

authRouter.get("/user-info",verifyUser,getDecodedUser)
authRouter.post("/logout",logout)
module.exports=authRouter