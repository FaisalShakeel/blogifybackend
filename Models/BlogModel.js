const { Schema, default: mongoose } = require("mongoose");

const BlogSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    tags:{
        type:Array,
        required:true
    },
    publishedByName:{
        type:String,
        required:true
    },
    publishedById:{
        type:String,
        required:true
    },
    publishedByPhotoUrl:{
        type:String,
        required:true
    },
    publishedByBio:{
        type:String,
        required:true,
        default:"Author on blogify"
    },
    likedBy:{
        type:Array,
        default:[]
    },
    comments:{
        type:Array,
        default:[]
    },
    content:{
        type:String,
        required:true
    },
    isInDraft:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})
const BlogModel=mongoose.model("Blog",BlogSchema)
module.exports=BlogModel