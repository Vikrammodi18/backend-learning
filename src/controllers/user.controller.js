
const asyncHandler = require("../utils/asyncHandler.js")
const ApiError = require("../utils/apiError.js")
const User = require("../models/users.model.js")
const uploadOnCloudinary = require('../utils/cloudinary.js')
const ApiResponse = require('../utils/apiResponse.js')
const jwt = require("jsonwebtoken")

//generating access and refresh token
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

//register user
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
      
    // console.log("req.body",req.body)
    const{email,username,fullName,password} = req.body
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
//login function 
const loginUser = asyncHandler(async (req, res)=>{
    //steps to login
    //1. check user is registered or not?
    //2. send email or password to login 
    //3. validate the email or password i.e. email or password present or not
    //4. check password or email correct or not
    //5. logged in 
    //6. attach refresh and access token to it
    const{email,username,password} = req.body
    if(!(username||email)){
        throw new ApiError(400,"cannot send empty value")
    }
    if(!password){
        throw new ApiError(400,"password is required!!")
    }
//     const credentials = [email,password]
//    if(credentials.some((val)=> val?.trim ===""||!val)) {
//     throw new ApiError(400,"cannot send empty value of email, username or password")
//    }
   const user = await User.findOne({
    $or:[{username},{email}]
    })
    if(!user){
        throw new ApiError(404,"user not found")
    }
    const isPasswordCorrect = await user.isPasswordCorrect(password)
    if(!isPasswordCorrect){
        throw new ApiError(403,"password is incorrect,!try again")
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

//logout function to logout the user
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
const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }
   try {
     const decodedToken = jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
     )
     const user = await User.findById(decodedToken?._id)
     if(!user){
         throw new ApiError(401,"invalid refresh token")
     }
     if(incomingRefreshToken !== user?.refreshToken){
         throw new ApiError(401,"Refresh token is expired or used")
     }
 
     const options = {
         httpOnly: true,
         secure:true,
     }
 
   const {accessToken,newRefreshToken}= await generateAccessAndRefreshToken(user._id)
 
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
     new ApiResponse(
         200,
         {accessToken,newRefreshToken},
         "Access token refreshed"
     )
    )
 
   } catch (error) {
    throw new ApiError(401,error.message||"invalid refresh token")
   }


})

const changeCurrentPassword = asyncHandler( async (req,res)=>{
    //take oldPassword and newPassword
    //validate password
    //check oldPassword and newPassword same or not 
    //verify oldPassword 
    //update newPassword
    
    // console.log(req.user)
    const{oldPassword, newPassword} = req.body
   
    // console.log(user)
    if(!(oldPassword&&newPassword)){
        throw new ApiError(400,"password are required")
    } 
    if(oldPassword === newPassword){
        throw new ApiError(400,"password would not be same as previous one")
    } 
    
    const user = await User.findById(req.user?._id) 
    if(!user){
        throw new ApiError(400,"user not found")
    } 
        
        
    const isVerifiedUser = await user.isPasswordCorrect(oldPassword)
    if(!isVerifiedUser){
        throw new ApiError(403,"password is incorrect!!")
    } 
    user.password = newPassword
    await user.save({validateBeforeSave:false})
    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "password change successfully"
        )
    )







    // console.log(req.cookies)
    // if(Object.keys(req.cookies).length ===0){
    //     throw new ApiError(403,"unauthorised access")
    // }
    // const {oldPassword,newPassword} = req.body
    // if(!(oldPassword && newPassword)){
    //     throw new ApiError(400,"password is required!")
    // }
    // if((oldPassword === newPassword)){
    //     throw new ApiError(400,"oldPassword is same as newPassword! change it")
    // }
   
    // const{refreshToken} = req.cookies
    // const decodedToken = jwt.verify(req.cookies?.refreshToken,process.env.REFRESH_TOKEN_SECRET)
    
    // const user = await User.findById(decodedToken?._id)
    // if(!user){
    //     throw new ApiError(400,"user not found")
    // }
    // const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    // if(!isPasswordCorrect){
    //     throw new ApiError(403,"password is not correct")
    // }

    // user.password = newPassword
    // user.save({validateBeforeSave:false})
    // return res.status(200).json(
    //     new ApiResponse(
    //         200,
    //         {},
    //         "password change successfully"
    //     )
    // )


})

const getCurrentUser = asyncHandler(async (req,res)=>{
    return res.status(200)
    .json(new ApiResponse(200,req.user,"current user fetch successfully"))
})
const updateAccountDetails = asyncHandler(async (req,res)=>{
    //required field to update
    //validate field
    //search user 
    //modified field
    //save document
    const{fullName,email} = req.body
    if(!(fullName||email)){
        throw new ApiError(400,"change field is required!!")
    }
    const field = {}
    if(email){
        field.email = email
    }
    if(fullName){
        field.fullName = fullName
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
                                                    {$set:field},
                                                    {new:true})
                                                    .select("-password -refressToken")
    
    
    return res.status(200,
        json(
            new ApiResponse(200,user,"update successfully")
        )
    )
})
const updateAvatar = asyncHandler(async (req,res)=>{
   const avatarLocalPath =  req.file?.path
   if(!avatarLocalPath){
    throw new ApiError(400,"avatarLocalPath is missing")
   }
   const avatar = uploadOnCloudinary(avatarLocalPath)
   if(!avatar?.url){
        throw new ApiError(400,"cloudinary file path is missing")
   }
   const user = User.findByIdAndUpdate(req.user?._id,
                                    {$set:{
                                        avatar:avatar?.url
                                    }},
                                    {new:true})
                                    .select("-password -refreshToken")
    return res.status(200)
              .json(
                new ApiResponse(200,user,"avatar is updated successfully")
              )
})
const updateCoverImage = asyncHandler(async (req,res)=>{
    const coverImageLocalPath =  req.file?.path
    if(!coverImageLocalPath){
     throw new ApiError(400,"coverImageLocalPath is missing")
    }
    const coverImage = uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage?.url){
         throw new ApiError(400,"coverImage file path is missing")
    }
    const user = User.findByIdAndUpdate(req.user?._id,
                                     {$set:{
                                        coverImage:coverImage?.url
                                     }},
                                     {new:true})
                                     .select("-password -refreshToken")
     return res.status(200)
               .json(
                 new ApiResponse(200,user,"avatar is updated successfully")
               )
 })
 const getUserChannelProfile = asyncHandler( async (req,res)=>{
    const {username} = req.params

    if(!username?.trim() === "") {
        throw new ApiError(404,"user is not found")

    }
   const channel = await User.aggregate([
        {
            $match:{
                username: username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addfields:{
                subscribersCound:{
                    $size:"$subscribers"
                },
                channelsSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in: [req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                username:1,
                subscribersCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1
            }
        }
    ])
    if(!channel?.length){
        throw new ApiError(404,"channel does not exists")
    }
    return res
    .status(200),
    json(
        new ApiResponse(200, channel[0],"user channel fetched successfully" )
    )
 })
module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateCoverImage,
    updateAvatar,
    getUserChannelProfile,
}