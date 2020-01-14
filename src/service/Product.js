const mongoose= require('mongoose');

// db model
const Product = mongoose.model('Product',{
    risk :{
        level: Number,
        desc:  String
    },
    name : String ,
    desc : String,
    idProduct :  {type : Number, unique : true},
    source: String
})

module.exports= Product; 
