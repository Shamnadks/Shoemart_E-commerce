const mongoose = require('mongoose');

const Schema = mongoose.Schema

const categorySchema = new Schema({
    category : {
        type : String,
        trim : true,
        uppercase : true
        
    }
})
module.exports = mongoose.model('category', categorySchema);
