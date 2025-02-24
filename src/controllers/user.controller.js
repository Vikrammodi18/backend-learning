const asyncHandler = require("../utils/asyncHandler.js")
const ApiError = require("../utils/apiError.js")
const User = require("../models/users.model.js")
const uploadOnCloudinary = require('../utils/cloudinary.js')
const ApiResponse = require('../utils/apiResponse.js')
const registerUser = asyncHandler( async (req,res)=>{
    //to register user
    //take data from frontend
    //validate - req is not empty
    //check user is already registered: email,usernam
    //check avatar, check image
    //upload them in the cloudinary
    //create user object - create entry to db
    //remove password,referesh token from res
    //check for user creation
    //return res
      
    const{email,username,fullName,password} = req.body
    console.log("req.body",req.body)
   let data = [email,username,fullName,password]
    if(
       ( data.some((field)=> field?.trim===""||!field))
   ){
    throw new ApiError(400,"all fields are required:")
   }
    if(!email.includes("@")){
        throw new ApiError(403,"email is not appropriate")
    }

    const existedUser = await User.findOne({$or:[{ email },{ username }]})

        if(existedUser){
            throw new ApiError(409,"user already exist")
        }
        console.log("req.files:",req.files)
        const avatarLocalPath = req.files?.avatar[0]?.path
        // const coverImageLocalPath = req.files?.coverImage[0]?.path
        let coverImageLocalPath;
        if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
            coverImageLocalPath = req.files.coverImage[0].path
        }
        if(!avatarLocalPath){
            throw new ApiError(400,"avatar file is required")
        }
        
        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)
        
        if(!avatar){
            throw new ApiError(400,'Avatar file is required')
        }
      const user = await User.create({
            fullName,
            avatar:avatar.url, 
            coverImage:coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        })
       const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
       )
       if (!createdUser){
        throw new ApiError(500,"something went wrong while registering the user")
       }
      res.status(200).json(
            new ApiResponse(200,createdUser,"User registered successfully")
    
    )
    
})

module.exports = {registerUser}