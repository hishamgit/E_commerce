var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/product_helpers')
const userHelper=require('../helpers/user_helpers')
//check whether seesion is on
const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/',async function(req, res, next) {
  let user=req.session.user
  // console.log(user)
  let cartCount=0
  if(user){
    cartCount=await userHelper.getCartCount(req.session.user._id)
  }
  productHelper.getAllProducts().then((products)=>{
    //console.log(products)
    res.render('user/view_products',{admin:false,products,user,cartCount})    //res.render not res.redirect
  })
});

/* GET login page. */
router.get('/login',(req,res,next)=>{
  if(req.session.loggedIn){
    res.redirect('/')           //wont goto login page if press back
  }else{
    res.render('user/login',{"loginErr":req.session.loginErr})
    req.session.loginErr=false
  }
})
router.get('/signup',(req,res)=>{
  res.render('user/signup')
})
router.post('/signup',(req,res)=>{
  userHelper.doSignup(req.body).then((response)=>{
    console.log(response)
    req.session.loggedIn=true
    req.session.user=response
  })
})
router.post('/login',(req,res)=>{
  userHelper.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true  //a variable
      req.session.user=response.user
      res.redirect('/')
    }else{
      req.session.loginErr="Invalid username or password"
      res.redirect('/login')
    }
  })
})
router.get('/logout',(req,res)=>{
  req.session.destroy()  
  res.redirect('/')
})
router.get('/cart',verifyLogin,async(req,res)=>{
  let products=await userHelper.getCartProducts(req.session.user._id)
    // console.log(products[0].cartItems)
    let data=products[0].cartItems
    res.render('user/cart',{data})
})
router.get('/add_to_cart/:id',(req,res)=>{
  // console.log('api call');
  userHelper.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true})   //json is a format for data transfer
    // res.redirect('/') ,since ajax is used
  })
})

module.exports = router; 
