const mongoose=require('mongoose')
const UserSchema=new mongoose.Schema({
    username:{
        type:String,
        unique:true,
        required:true,
        min:6,
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
        min:8
    },
    balance:{
        type:Number,
        default:1000
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:'user'
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});
module.exports = mongoose.model('User',UserSchema);