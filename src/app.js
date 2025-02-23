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

app.use("/api/v1/users", userRouter)

//http://localhost:3000/api/v1/users/register
module.exports = app
