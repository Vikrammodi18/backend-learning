const express = require("express")
const cookieParser = require('cookie-parser')
const cors = require('cors')
const app = express()
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit:"16kb"}))
app.use(express.static("public"))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(cookieParser())

//routes import

const userRouter = require("./routes/user.routes.js")
const videoRouter = require("./routes/video.routes.js")
const subscriptionRouter = require("./routes/subscription.route.js")


//http://localhost:3000/api/v1/users/register
app.use("/api/v1/users", userRouter)

//http://localhost:3000/api/v1/videos
app.use("/api/v1/videos",videoRouter)

//http://localhost:3000/api/v1/subscripion
app.use("/api/v1/subscription",subscriptionRouter)
module.exports = app
