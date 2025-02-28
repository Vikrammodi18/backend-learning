const asyncHandler = require("../utils/asyncHandler.js")
const ApiError = require("../utils/apiError.js")
const jwt = require("jsonwebtoken")
const User = require("../models/users.model.js")

const verifyJWT = asyncHandler( async (req,_,next)=>{
   try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("bearer ","")
 
    if(!token){
     throw new ApiError(401,"unauthorized request")
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    if(!user){
     throw new ApiError(401,"Invalid access token")
    }
    req.user = user 
    next()
   } catch (error) {
    throw new ApiError(401, error?.message||"invalid access token")
   }
})

module.exports = {verifyJWT}