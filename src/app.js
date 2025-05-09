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
const likeRouter = require('./routes/like.route.js')
const commentRouter = require("./routes/comment.route.js")
const playlistRouter = require('./routes/playlist.route.js')
//http://localhost:3000/api/v1/users/register
app.use("/api/v1/users", userRouter)

//http://localhost:3000/api/v1/videos
app.use("/api/v1/videos",videoRouter)

//http://localhost:3000/api/v1/subscripion
app.use("/api/v1/subscription",subscriptionRouter)


app.use("/api/v1/like",likeRouter)

app.use("/api/v1/comment",commentRouter)

app.use("/api/v1/playlist",playlistRouter)
module.exports = app
