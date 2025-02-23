require('dotenv').config({path:'./env'})

const app = require('./app.js')

const connectDB = require("./db/index.js");
const port = process.env.PORT || 8000
console.log("hello")
connectDB()
.then(()=>{
    app.listen(port,()=>{
        console.log(`server start at ${port}`)
    })
    app.on("error",(err)=>{
        console.log("your app is not running:",err)
        throw err
    })
})
.catch((err)=>{
    console.error("mongodb connection failed",err)
})

























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

