var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const Promise = require('promise')
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
                    console.log(status)
                    if(status){
                        console.log('login success')
                        response.user=user
                        response.status=true
                        resolve(response)
                        console.log(user)
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
    }
}