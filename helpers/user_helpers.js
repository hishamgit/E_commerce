var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const Promise = require('promise')
var objectId=require('mongodb').ObjectId

module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.Password = await bcrypt.hash(userData.Password, 10)  // '10' is how fast
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(async (data) => {
                resolve(await db.get().collection(collection.USER_COLLECTION).find(userData._id).toArray()) //data._id won't work
            })
        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email })
            if (user) {
                // console.log(userData.Password)
                // console.log(user.Password)
                bcrypt.compare(userData.Password,user.Password).then((status) => {
                    // console.log(status)
                    if(status){
                        console.log('login success')
                        response.user=user
                        response.status=true
                        resolve(response)
                        // console.log(user)
                    }else{
                        console.log('login failed password incorrect')
                        resolve({status:false})
                    }
 
                })

            } else {
                console.log('login failed no user')
                resolve({status:false})
            }
        })
    },
    addToCart:(proId,userId)=>{
        let proObj={
            item:new objectId(proId),
            quantity:1
        }
        return new Promise(async(resolve,reject)=>{
            let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:new objectId(userId)})
            if(userCart){
                let proExist=userCart.products.findIndex(product=> product.item==proId) //check same product already there
                if(proExist!=-1){
                    db.get().collection(collection.CART_COLLECTION).updateOne({'products.item':new objectId(proId)},{
                        $inc:{'products.$.quantity':1}
                    }).then(()=>{
                        resolve()
                    })
                }else{
                    console.log(proExist) // 0 in console indicates zeroth element ,if -1 no same product  
                db.get().collection(collection.CART_COLLECTION).updateOne({user:new objectId(userId)},{
                        $push:{products:proObj}
                }).then(()=>{
                    resolve()
                })
                }
            }else{
                let cartObj={ 
                    user:new objectId(userId),          // all Id's are saved as object id
                    products:[proObj]      //[products are in array] hence []
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve()
                })
            }
        })
    },
     getCartProducts:(userId)=>{
        return new Promise((resolve,reject)=>{
            let cartItems=db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:new objectId(userId)}
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        let:{prodList:'$products'},
                        pipeline:[
                            {
                                $match:{
                                    $expr:{
                                        $in:['$_id','$$prodList']
                                    }
                                }
                            }
                        ],
                        as:'cartItems'
                    }
                }
            ]).toArray()
                resolve(cartItems)
        })
    },
    getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count=0
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:new objectId(userId)})
            if(cart){
                count=cart.products.length
            }
            resolve(count)
        })
    }
}