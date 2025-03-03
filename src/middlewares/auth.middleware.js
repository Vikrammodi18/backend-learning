const asyncHandler = require("../utils/asyncHandler.js")
const ApiError = require("../utils/apiError.js")
const jwt = require("jsonwebtoken")
const User = require("../models/users.model.js")

const verifyJWT = asyncHandler( async (req,_,next)=>{
   
   try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
   //  console.log(`token:${token}`)
   //  console.log(`access cookie from middleware:${req.cookies.name}`)
    if(!token){
     throw new ApiError(401,"unauthorized request")
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
   //  console.log(`decoded token:${decodedToken.email}`)
    const user = await User.findById(decodedToken?._id).select("-password")
    if(!user){
     throw new ApiError(401,"Invalid access token")
    }
    req.user = user 
   //  console.log("after verify req.user:",req.user)
    next()
   } catch (error) {
    throw new ApiError(401, error?.message||"invalid access token")
   }
})

module.exports = {verifyJWT}