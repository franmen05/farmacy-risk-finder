const mongoose= require('mongoose');

// db model
const ProductTitle = mongoose.model('ProductTitle',{
    id : Number ,
    type: String,
    name_es : String ,
    name_en : String
})

module.exports= ProductTitle; 
