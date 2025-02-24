const express=require('express')
const multer=require('multer')
const { createAccount, login } = require('../Controllers/UserController');
const { createList, getList, getMyLists, addToList } = require('../Controllers/ListController');
const { verify } = require('jsonwebtoken');
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
const listRouter=express.Router()
listRouter.post("/create",upload.single("photo"),verifyUser,createList)
listRouter.get("/all-lists",verifyUser,getMyLists)
listRouter.put("/add-blog",verifyUser,addToList)
module.exports=listRouter