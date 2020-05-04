const express= require('express');
const router= new express.Router();


//scrapper
const rp = require('request-promise-native');
const cheerio = require('cheerio');

const Product=  require('../service/Product')
const ProductTitle=  require('../service/ProductTiftle')
const data=  require('../service/util/iniitalData')


const mongoose = require('mongoose');
//mongo config
const conURL= 'mongodb+srv://dbUse:654789@cluster0-oi4bs.mongodb.net/test?retryWrites=true&w=majority';
// const conURL= 'mongodb://127.0.0.1:27017/';
const dbName= 'farmacy-risk';


mongoose.connect(conURL+dbName,{
    useNewUrlParser: true,
    useCreateIndex : true,
    useUnifiedTopology: true,
    useFindAndModify: true
});



router.get('/initalLoad',(req,res)=>{


    data.map(x => {
        console.info(x.id +" - "+x.nombre_en);

        ProductTitle.findOne({ id: x.id},  (err, product) =>{
        
            if(product){
                console.log('EL PRODUCTO YA EXISTE :',product);
    
            }else{ 
                console.error('GUARDANDO');

                const me = new ProductTitle({
                    id : x.id,
                    name_es : x.nombre_es,
                    name_en : x.nombre_en
                });


                me.save()
                    .then(() => {
                        console.log(me);
                        // res.status(201).send(me);
                        // process.exit();
                    }).catch((error) => {
                        console.error('Error! : ', error);
                        // res.status(404).send(error);
                        // process.exit();
                    });

            }
          
        });
            

    });

    res.send("Listo");

});


router.get('/findByName/:name',(req,res)=>{

    findProductByName(req.params.name,req,res,false);

});


router.get('/find/:id',(req,res)=>{

    findProduct(req.params.id,req,res,false);

});


router.get('/findMultiple/:firstId/:lastId',(req,res)=>{


    let lastId=req.params.lastId;
    let firstId=req.params.firstId;
    
    console.debug(firstId);
    console.debug(lastId);

    for(firstId ; firstId<=lastId ; firstId++){
        console.debug(firstId);
        findProduct(firstId,req,res,true);
    }

    res.send("Procesando");

});

module.exports= router;

function findProductByName(name,req,res,isMultiple){

    ProductTitle.find({ name_es : {'$regex': name}},  (err, product) =>{
        
        if(product){
            console.log('Valor de  temp :',product);
            if(!isMultiple)
                res.send(product);

        }
      
    });
}

function findProduct(idProduct,req,res,isMultiple){
    
    Product.findOne({ idProduct},  (err, product) =>{
        
        if(product){
            console.log('Valor encontrado :',product);
            if(!isMultiple)
                res.send(product);

        }else{ 
            // console.error('SEGUI');
            findInWebProduct(idProduct,req, res);
        }
      
    });
}


function findInWebProduct(idProduct,req, res) {

    const options = {
        uri: `http://www.e-lactancia.org/producto/${idProduct}`,
        transform(body) {
            // console.debug(body);
            return cheerio.load(body);
        }
    };

    rp(options)
        .then(($) => {

            let name = $('h1.term-header ').text().trim();
            let title = $('h2.risk-header ').text();
            let desc = '';
            // console.debug($('h2.risk-header ').text());
            let risk = getRiskLevel(title);
            Array.from($(`div.squared.risk-comment-level${risk.level}`).children()).forEach(obj => desc += obj.children[0].data);

            const me = new Product({
                risk,
                name,
                desc: desc.trim(),
                idProduct,
                source : options.uri
            });

            //save into DB
            me.save()
                .then(() => {
                    // console.log(me);
                    // res.status(201).send(me);
                    // process.exit();
                }).catch((error) => {
                    // console.error('Error! : ', error);

                    // res.status(404).send(error);
                    // process.exit();
                });
            res.status(201).send(me);
        })
        .catch((err) => {

            console.error('Error en Scrapper : ' );
            res.status(410).send('No hemos encontrado la página que buscabas. Por favor, prueba con otra búsqueda.');

        }).finally(() => {
        });
}

function getRiskLevel(title) {

    let riskLeve = 0;
    
    if (title === 'Riesgo bajo para la lactancia')
        riskLeve = 1;
    else if (title === 'Riesgo alto para la lactancia')
        riskLeve = 2;
    else if (title === 'Riesgo muy alto para la lactancia')
        riskLeve = 3;

    return {level:riskLeve,desc:title};
}
