const Like = require("../models/likes.model.js")
const {mongoose,isValidObjectId}= require("mongoose")
const ApiError = require('../utils/apiError.js')
const ApiResponse = require('../utils/apiResponse.js')
const asyncHandler = require("../utils/asyncHandler.js")

const toggleVideoLike = asyncHandler(async (req, res) => {
    //check video id
    //check userloggedin i.e. user_id
    //check video is already liked by same person or not 
    //if yes :- then remove like
    //remove document from like collection, find videoId and userId because that delelte on that  document which contain likeby user and videoid
    //else no :- then liked that video by user

   
    const {videoId} = req.params
    const likedBy = req.user?._id
    
    //TODO: toggle like on video
    if(!videoId){
        throw new ApiError(400,"video id is required")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video Id")
    }
    if(!likedBy){
        throw new ApiError(400,"user must logged in!!")
    }
    const videoLikedByUser = await Like.findOne({video: new mongoose.Types.ObjectId(videoId),likedBy})
 
    if(videoLikedByUser){
        await Like.deleteOne({video:videoId,likedBy})
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "unlike"
                )
            )
    }
    else{
       const liked = await Like.create({video:videoId,likedBy})
       if(!liked){
        throw new ApiError(500,"something went wrong while like the video")
       }

       return res
        .status(200)
        .json(
            new ApiResponse(200,{liked},"video is liked")
        )
    }
})

module.exports = {
    toggleVideoLike,
}