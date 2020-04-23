// const request= require('request');

// const validator= require('validator');
const express=  require('express');
const user= require('./src/view/appService');


//Express
const app  = express();
const port = process.env.PORT || 3000;

app.use(user);

app.listen(port,()=>{
    console.info('Server Start  in  '+port+' port');
});

