const MongoClient = require('mongodb').MongoClient
const state = {
    db:null
}
module.exports.connect=async (done) => {
    try {
        const url ='mongodb://127.0.0.1:27017'
        const dbname ='shopping'

        const client =await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
        state.db = client.db(dbname)
        return done()  
    } 
    catch (error) {
        return done(error)
    }
}
module.exports.get = function () {
    return state.db
}