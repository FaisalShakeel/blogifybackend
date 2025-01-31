const express=require('express')
const connectToMongoDB=require('./dbconnection')
const app=express()
connectToMongoDB()
const PORT=process.env.PORT||5000
app.listen(PORT,()=>{
    console.log("Listening ON Port",PORT)
})