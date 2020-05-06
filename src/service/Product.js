const mongoose= require('mongoose');

// db model
const Product = mongoose.model('Product',{
    risk :{
        level: Number,
        desc:  String
    },
    name : String ,
    desc : String,
    type : String,
    idProduct :  {type : Number, unique : false},
    source: String
})

module.exports= Product; 
