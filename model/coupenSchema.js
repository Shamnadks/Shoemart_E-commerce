const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')

const coupon = mongoose.Schema({

    code:{
        type:String,
        required:true
    },
    date:{
        type:String,
        required:true
    },
    percentage:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        default:"Active"  
    },
    userId:[{
        type:ObjectId
    }]
})
module.exports = mongoose.model("Coupon",coupon)