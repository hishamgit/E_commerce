var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/product_helpers')
const userHelper=require('../helpers/user_helpers')

//check whether seesion is on
const verifyLogin=(req,res,next)=>{
  if(req.session.user){
    next()
  }else{
    res.redirect('/login')
  }
}
//check cart is present or not


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
  if(req.session.user){
    res.redirect('/')           //wont goto login page if press back
  }else{
    res.render('user/login',{"loginErr":req.session.userloginErr})
    req.session.userloginErr=false
  }
})
router.get('/signup',(req,res)=>{
  res.render('user/signup')
})
router.post('/signup',(req,res)=>{
  userHelper.doSignup(req.body).then((response)=>{
    console.log(response)
    
    req.session.user=response
    req.session.userLoggedIn=true
    res.redirect("/");
  })
})
router.post('/login',(req,res)=>{
  userHelper.doLogin(req.body).then((response)=>{
    if(response.status){
 
      req.session.user=response.user
      req.session.userLoggedIn=true  //a variable
      res.redirect('/')
    }else{
      req.session.userloginErr="Invalid username or password"
      res.redirect('/login')
    }
  })
})
router.get('/logout',(req,res)=>{
  req.session.user=null      //not destroy() session
  req.session.userLoggedIn=false
  res.redirect('/')
})
router.get('/cart',verifyLogin,async(req,res)=>{
  let products=await userHelper.getCartProducts(req.session.user._id)
  let data1=0
  await userHelper.getTotalAmount(req.session.user._id).then((total)=>{
    if (typeof total !== 'undefined' && total.length > 0){
      data1=total[0].total
    }
  })

  //  console.log(products)
  let data=products
    res.render('user/cart',{data,data1,user:req.session.user})
})
router.get('/add_to_cart/:id',(req,res)=>{
  // console.log('api call');
  userHelper.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true})   //json is a format for data transfer
    // res.redirect('/') ,since ajax is used not possible
  })
})
router.post('/change_product_quantity',(req,res,next)=>{
  userHelper.changeProductQuantity(req.body).then(async(response)=>{
    let total=await userHelper.getTotalAmount(req.body.user)

    response.total=total[0].total   //total is added to object
    // console.log(data)
    res.json(response)  //response is passed to ajax  //here whole page is not refreshing in ajax,hence json format is returned
  })
})
router.post('/remove_product',(req,res,next)=>{
  userHelper.removeProduct(req.body).then((response)=>{
    res.json(response)
  })
})
router.get('/place_order',verifyLogin,async(req,res)=>{
  let total=await userHelper.getTotalAmount(req.session.user._id)
  let data=0
  if (typeof total !== 'undefined' && total.length > 0){
    data=total[0].total
  }

  res.render('user/place_order',{data,user:req.session.user})
})
router.post('/place_order',async (req,res)=>{
  let products=await userHelper.getCartProducts(req.body.userId)
  let totalPrice=0
  if(products.length>0){
    totalPrice=await userHelper.getTotalAmount(req.body.userId)
  }
   
userHelper.placeOrder(req.body,products,totalPrice).then((orderId)=>{
  if(req.body['pay']==='COD'){
    res.json({codSuccess:true})
  }else{
    userHelper.generateRazorpay(orderId,totalPrice).then((resp)=>{
      res.json(resp)
    })
  }
  
})
})
router.get('/order',(req,res)=>{
  res.render('user/order')
})
router.post('/order1',verifyLogin,async(req,res)=>{
  let orders=await userHelper.getOrderDetails(req.session.user._id)
  // console.log(orders)
  res.render('user/order1',{orders,user:req.session.user._id})      //pass data in {}
})
router.get('/view_order',verifyLogin,async(req,res)=>{
  let order_data=await userHelper.getOrderProducts(req.session.user._id)  //Promise { _x: 0, _y: 0, _z: null, _A: null } if no await
  console.log(order_data)
  res.render('user/order_data',{order_data})
})
router.post('/verify_payment',(req,res)=>{
  console.log(req.body)
  userHelper.verifyPayment(req.body).then(()=>{
    userHelper.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      console.log('payment success')
      res.json({status:true})
    }).catch((err)=>{
      // console.log(err)
      res.json({status:false,errMsg:err})
    })
  })
})
router.get('/front_display',verifyLogin,async(req,res)=>{
  let order_data=await userHelper.getOrderProducts(req.session.user._id)  //Promise { _x: 0, _y: 0, _z: null, _A: null } if no await
  // console.log(order_data)
  let details= await userHelper.getOrderDetails(req.session.user._id)
  console.log(details[0].ship)
  data=details[0].ship
  res.render('user/order_data',{order_data,data})
})
router.get('/user_profile/:id',async(req,res)=>{
  let userData=await userHelper.getUser(req.params.id)
  // console.log(userData)
  res.render('user/profile',{userData})
})

module.exports = router; 
