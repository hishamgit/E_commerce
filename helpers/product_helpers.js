 var db=require('../config/connection')
 var collection=require('../config/collections')
 const Promise=require('promise') 
 var objectId=require('mongodb').ObjectId
 var bcrypt = require('bcrypt')

 module.exports={
    addProduct:(product,callback)=>{
        //console.log(product)
        db.get().collection('product').insertOne(product).then(()=>{           //collection,insertOne already with promise,hence.then() works here
            callback(product._id)
        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()  //await is given since promise works as async
            resolve(products)
        })
    },
    deleteProduct:(proId)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:new objectId(proId)}).then((data)=>{       //removeOne is deprecated
                console.log(data)
                resolve(data)
            })
                
        })
    },
    getProductDetails:(proId)=>{
        return new Promise(async (resolve,reject)=>{
            await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:new objectId(proId)}).then((product)=>{
                resolve(product)
            })
        })
    },
    updateProduct:(proId,proDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:new objectId(proId)},{
                $set:{
                Name:proDetails.Name,
                Description:proDetails.Description,
                Category:proDetails.Category,
                Price:proDetails.Price
            }}).then(()=>{
                resolve()
            })
        })
    },
    getAllOrder:()=>{
        return new Promise(async(resolve,reject)=>{
            let order=await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
            resolve(order)
        })
    },
    getAllUser:()=>{
        return new Promise(async(resolve,reject)=>{
            let user=await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(user)
        })
    },
    getProcessingOrders:(userid)=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:new objectId(userid)})
            resolve(products)
        })
    },
    changeShip:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:new objectId(orderId)},{
                $set:{
                    ship:true
                }
            }).then(()=>{
                resolve()
            })
        })
    },
    doAdminLogin:(adminData)=>{
        return new Promise(async(resolve,reject)=>{
            let response = {}
            let admin = await db.get().collection('admin').findOne({mail:adminData.Email})
            
                console.log(adminData.Password)
                console.log(admin.password)
                bcrypt.compare(adminData.Password,admin.password).then((status) => {
                    // console.log(status)
                    if (status) {
                        console.log('login success')
                        response.admin = admin
                        response.status = true
                        resolve(response)
                        // console.log(user)
                    } else {
                        console.log('login failed password incorrect')
                        resolve({ status: false })
                    }

                })

            
        })
    }

 }