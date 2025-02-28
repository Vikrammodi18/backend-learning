const asyncHandler = require("../utils/asyncHandler.js")
const ApiError = require("../utils/apiError.js")
const User = require("../models/users.model.js")
const uploadOnCloudinary = require('../utils/cloudinary.js')
const ApiResponse = require('../utils/apiResponse.js')

const generateAccessAndRefreshToken = async (userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
    } catch (error) {
        throw ApiError(400,"error while generating access and refresh token")
    }
   
}

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
const loginUser = asyncHandler(async (req, res)=>{
    //steps to login
    //1. check user is registered or not?
    //2. send email or password to login 
    //3. validate the email or password i.e. email or password present or not
    //4. check password or email correct or not
    //5. logged in 
    //6. attach refresh and access token to it
    const{email,username,password} = req.body
    
    const credentials = [email,password]
   if(credentials.some((val)=> val?.trim ===""||!val)) {
    throw new ApiError(400,"cannot send empty value of email, username or password")
   }
   const user = await User.findOne({
    $or:[{username},{email}]
    })
    if(!user){
        throw ApiError(404,"user not found")
    }
    const isPasswordCorrect = await user.isPasswordCorrect(password)
    if(!isPasswordCorrect){
        throw ApiError(403,"password is incorrect,!try again")
    }


   
    const{accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    
    const options = {
        httpOnly:true,
        secure: true,
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken,
                refreshToken
            },
            "user logged In Successfully"
    )
    )

})

const logoutUser = asyncHandler(async (req, res)=>{
      await User.findByIdAndUpdate(req.user._id,
        {
            refreshToken: undefined
        },
        {
            new:true
        }
    )
    const options = {
        httpOnly: true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user logged out"))
})

module.exports = {registerUser,loginUser,logoutUser}