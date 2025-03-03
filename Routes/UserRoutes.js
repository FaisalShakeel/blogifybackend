const express=require('express')
const multer=require('multer')
const { createAccount, login, follow, getProfile } = require('../Controllers/UserController');
const { verifyUser } = require('../Middlewares/VerifyUser');
// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });

  const upload = multer({ storage: storage });
const userRouter=express.Router()
userRouter.post("/create-account",upload.single("profilePhoto"),createAccount)
userRouter.post("/login",login)
userRouter.post("/follow",verifyUser,follow)
userRouter.get("/profile/:id",verifyUser,getProfile)
module.exports=userRouter