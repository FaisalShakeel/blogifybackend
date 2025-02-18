const { Schema, default: mongoose } = require("mongoose");
const ListSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    createdBy:{
        type:String,
        required:true
    },
    blogs:{
        type:Array,
        required:true
    },
    photoUrl:{
        type:String,
        required:true
    }
})
const ListModel=mongoose.model("List",ListSchema)
module.exports=ListModel