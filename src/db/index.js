const mongoose = require('mongoose')
const {DB_NAME} = require('../constants')
require('dotenv').config()

const connectDB = async ()=>{
    console.log("hello")
    try {
       const connectionInstance= await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
       console.log("connection is successful,DB_HOST:",connectionInstance.connection.host)
    } catch (error) {
        console.error("error: mongoDB connection failed",error)
        process.exit(1)
    }
   
}
module.exports = connectDB