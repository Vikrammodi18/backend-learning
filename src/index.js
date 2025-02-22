require('dotenv').config({path:'./env'})

const connectDB = require("./db/index.js");

console.log("hello")
connectDB()

























// const express = require('express')
// const app = express()

// ;(async ()=>{
//     try {
//        await mongoose.connect(`${MONGO_URI}/${DB_NAME}`)
//        app.on("error",(err)=>{
//         console.log("unable to connect with express:",err)
//         throw err
//        })

//        app.listen(process.env.PORT,()=>{
//         console.log(`app is running at ${process.env.PORT}`)
//        })

//     } catch (error) {
//         console.error("ERROR:",error)
//         throw
//     }
// })()

