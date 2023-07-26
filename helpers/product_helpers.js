 var db=require('../config/connection')
 var collection=require('../config/collections')
 const Promise=require('promise') 
 var objectId=require('mongodb').ObjectId
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
    }
 }