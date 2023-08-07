var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/product_helpers')

//check whether seesion is on
const verifyLoginAdmin=(req,res,next)=>{
  if(req.session.admin){
    next()
  }else{
    res.redirect('/admin/adminlogin')
  }
}


/* GET users listing. */
router.get('/',verifyLoginAdmin,function(req, res, next) {
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
router.get('/edit_product/:id',async (req,res)=>{
  console.log(req.params.id)
  let product=await productHelper.getProductDetails(req.params.id)
  // console.log(product)
  res.render('admin/edit_product',{product})
})
router.post('/edit_product/:id',async(req,res)=>{
  console.log(req.params.id)
  await productHelper.updateProduct(req.params.id,req.body).then((data)=>{
    res.redirect('/admin')
    if(req.files.Image){
      image=req.files.Image
      image.mv('./public/product_images/'+req.params.id+'.png')
    }
  })
})
router.get('/orders',(req,res)=>{
    productHelper.getAllOrder().then((orders)=>{
     
    // console.log(orders)
    res.render('admin/view_orders',{orders})
  })
})
router.get('/users',(req,res)=>{
  productHelper.getAllUser().then((users)=>{
   
  console.log(users)
  res.render('admin/view_users',{users})
})
})
router.get('/orderProducts/:id',(req,res)=>{
  
  productHelper.getProcessingOrders(req.params.id).then((products)=>{
    res.render('admin/order_products',{products})
  })
})
router.get('/change_ship/:id',(req,res)=>{
  productHelper.changeShip(req.params.id).then(()=>{
    res.redirect('/admin/orders')
  })
})
router.get('/adminlogin',(req,res,next)=>{
  if(req.session.admin){
    res.redirect('/admin')           //wont goto login page if press back
  }else{
    res.render('admin/login',{"loginErr":req.session.adminloginErr})
    req.session.adminloginErr=false
  }
})
router.post('/adminlogin',(req,res)=>{
  productHelper.doAdminLogin(req.body).then((response)=>{
    if(response.status){
 
      req.session.admin=response.admin
      req.session.admin.loggedIn=true  
      res.redirect('/admin')
    }else{
      console.log('login fail')
      req.session.adminloginErr="Invalid username or password"
      res.redirect('/admin/adminlogin')
    }
  })
})
router.get('/logout',(req,res)=>{
  req.session.admin=null      //not destroying session
  res.redirect('/admin')
})


module.exports = router;
