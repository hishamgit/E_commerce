var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const Promise = require('promise')
var objectId=require('mongodb').ObjectId
var Razorpay=require('razorpay')
var instance = new Razorpay({ key_id: 'rzp_test_JPdrAvWLBaxHLJ', key_secret: 'xYFoD0cgIccC2466NPivqSJ5' })

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
                bcrypt.compare(userData.Password, user.Password).then((status) => {
                    // console.log(status)
                    if (status) {
                        console.log('login success')
                        response.user = user
                        response.status = true
                        resolve(response)
                        // console.log(user)
                    } else {
                        console.log('login failed password incorrect')
                        resolve({ status: false })
                    }

                })

            } else {
                console.log('login failed no user')
                resolve({ status: false })
            }
        })
    },
    addToCart: (proId, userId) => {
        let proObj = {
            item: new objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new objectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId) //check same product already there
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: new objectId(userId), 'products.item': new objectId(proId) }, {
                        $inc: { 'products.$.quantity': 1 } //$ since array
                    }).then(() => {
                        resolve()
                    })
                } else {
                    console.log(proExist) // 0 in console indicates zeroth element ,if -1 no same product  
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: new objectId(userId) }, {
                        $push: { products: proObj }
                    }).then(() => {
                        resolve()
                    })
                }
            } else {
                let cartObj = {
                    user: new objectId(userId),          // all Id's are saved as object id
                    products: [proObj]      //[products are in array] hence []
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    getCartProducts: (userId) => {
        return new Promise((resolve, reject) => {
            let cartItems = db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: new objectId(userId) }
                },
                {
                    $unwind: '$products'                                            // divides products into multiple
                },
                {
                    $project: {                                                      // what we need
                        item: '$products.item',                                      // takes item from every product
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, //item,quantity needed(1)
                        product: { $arrayElemAt: ['$product', 0] }  // change object to array
                    }
                },
                // {
                //     $lookup:{
                //         from:collection.PRODUCT_COLLECTION,
                //         let:{prodList:'$products'},  //localfield not used since products are in array
                //         pipeline:[
                //             {
                //                 $match:{
                //                     $expr:{
                //                         $in:['$_id','$$prodList']
                //                     }
                //                 }
                //             }
                //         ],
                //         as:'cartItems'
                //     }
                // }
            ]).toArray()
            resolve(cartItems)
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new objectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    },
    changeProductQuantity: (details) => {
        count = parseInt(details.count)
        return new Promise((resolve, reject) => {
            if (details.quantity == 1 && details.count == -1) {
                db.get().collection(collection.CART_COLLECTION).updateOne(
                    { _id: new objectId(details.cart) }, {
                    $pull: { products: { item: new objectId(details.product) } }
                }).then((response) => {
                    resolve({ removeProduct: true })
                })
            } else {
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: new objectId(details.cart), 'products.item': new objectId(details.product) }, {        //cartId is available here,hence userId not needed
                    $inc: { 'products.$.quantity': count } //$ since array
                }).then((response) => {
                    resolve({ status: true })
                })
            }
        })
    },
    removeProduct: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne(
                { _id: new objectId(data.cart), 'products.item': new objectId(data.product) }, {
                $pull: {
                    products: { item: new objectId(data.product) }
                }
            }
            )
        })
    },
    getTotalAmount: (userId) => {
            
            return new Promise((resolve, reject) => {
                let total = db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match: { user: new objectId(userId) }
                    },
                    {
                        $unwind: '$products'                                            // divides products into multiple
                    },
                    {
                        $project: {                                                      // what we need
                            item: '$products.item',                                      // takes item from every product
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, //item,quantity needed(1)
                            product: { $arrayElemAt: ['$product', 0] }  // change object to array
                        }
                    },
                    {
                        $group: {        //group to sum every prod
                            _id: null,

                            total: { $sum: { $multiply: ['$quantity', { '$toInt': '$product.Price' }] } }

                        }
                    }
                ]).toArray()
                resolve(total)
            })
        },
        placeOrder: (order, products, total) => {
            let products0= [products.map(function (a) { return [a.item, a.quantity] })]
            return new Promise((resolve, reject) => {
                // console.log(order,products,total)
                let status = order.pay === 'COD' ? 'placed' : 'pending'  //if 
                let orderObj = {
                    deliveryDetails: {
                        mobile: order.mobile,
                        address: order.address,
                        pin: order.pin
                    },
                    userId: new objectId(order.userId),
                    paymentMethod: order.pay,
                    products: products0[0],
                    status: status,
                    totalAmount: total[0].total,
                    date: new Date()
                }
                // console.log(orderObj)
                db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((orderId) => {
                    db.get().collection(collection.CART_COLLECTION).deleteOne({ user: new objectId(order.userId) })
                    resolve(orderId.insertedId)
                })
            })
        },
        getOrderDetails:(userId)=>{
            return new Promise((resolve,reject)=>{
                let orders=db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match: { userId: new objectId(userId) }
                    },
                    {
                        $unwind: '$products'                                          
                    }
                ]).toArray()
                    resolve(orders)
                })
        },
        getOrderProducts:(userId)=>{
            return new Promise((resolve, reject) => {
                let orderItems = db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match: { userId: new objectId(userId) } 
                    },
                    {
                        $unwind: '$products'                                            
                    },
                    {
                        $project:
                        {
                           item: { $arrayElemAt: [ "$products", 0 ] },
                           quantity: { $arrayElemAt: [ "$products", 1 ] } //array positional filter
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1,
                            product: { $arrayElemAt: ['$product', 0] }  // change object to array
                        }
                    },
                ]).toArray()
                resolve(orderItems)
            })
        },
        generateRazorpay:(orderId,total)=>{
            return new Promise((resolve,reject)=>{
                
                instance.orders.create({
                    amount: (total[0].total)*100,
                    currency: "INR",
                    receipt: ""+orderId,
                    notes: {
                      key1: "value3",
                      key2: "value2"
                    }
                  },(err,order)=>{
                    if(err){
                        console.log(err)
                    }else{
                        // console.log("new order:",order)
                        resolve(order)
                    }
                  })
            })
        },
       
    
}