var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/product_helpers')

/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelper.getAllProducts().then((products)=>{
    console.log(products)
    res.render('admin/view_products',{admin:true,products})
  })
});
router.get('/add_products', function(req, res, next) {
  res.render('admin/add_products',{admin:true})
})
router.post('/add_products',(req, res,next)=> {
  // console.log(req.body);
  // console.log(req.files.Image)
  productHelper.addProduct(req.body,(id)=>{
    let image=req.files.Image
    //console.log(id);
    image.mv('./public/product_images/'+id+'.png',(err)=>{
      if(!err){
        res.render('admin/add_products')      //showing again
      }else{console.log(err)};
    })
  })
})
router.get('/delete_product',(req,res)=>{
  let proId=req.query.id
  productHelper.deleteProduct(proId).then((data)=>{
    res.redirect('/admin/')
  })
  // console.log(proId);
  // console.log(req.query.name)                       //req.body is in .post
})
module.exports = router;
