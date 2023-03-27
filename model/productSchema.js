const mongoose=require('mongoose')
const Schema=mongoose.Schema

ObjectId = Schema.ObjectId
const productSchema=new Schema({
    productName:{
        type:String,
        required:true
    },
    price:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    stock:{
        type:Number,
        required:true
    },
    images:{
        type:Array,
        // required:true
    },
    
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"category",
        required:true

    }
    ,isDeleted:{
        type:Boolean
    }

})
module.exports=mongoose.model('Product',productSchema)