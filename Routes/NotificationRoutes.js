const express=require('express')

const { verifyUser } = require('../Middlewares/VerifyUser');
const { getMyNotifications } = require('../Controllers/NotificationController');
;
const notificationRouter=express.Router()
notificationRouter.get("/all-notifications",verifyUser,getMyNotifications)

module.exports = notificationRouter