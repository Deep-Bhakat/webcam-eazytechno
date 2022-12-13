const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const videoSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    patientId:{
        type:Number,
        required:true
    },
    docId:{
        type:Number,
        required:true
    },
    msg:{
        type:String,
        required:true
    },
});
module.exports=mongoose.model("Video",videoSchema);