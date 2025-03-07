const Like = require("../models/likes.model.js")
const {mongoose,isValidObjectId}= require("mongoose")
const ApiError = require('../utils/apiError.js')
const ApiResponse = require('../utils/apiResponse.js')
const asyncHandler = require("../utils/asyncHandler.js")
const { findOne, deleteOne } = require("../models/users.model.js")

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
const toggleCommentLike = asyncHandler(async (req, res) => {
   
     const {commentId} = req.params
     //TODO: toggle like on comment
     if(!commentId){
         throw new ApiError(400,"comment Id is required")
     }
     
     if(!isValidObjectId(commentId)){
         throw new ApiError(400,"invalid comment id")
     }
     const likedBy = req.user?._id
     const isCommentLiked = await Like.findOne({likedBy,comment:new mongoose.Types.ObjectId(commentId)})
     if(isCommentLiked){
         await Like.deleteOne({likedBy,comment:new mongoose.Types.ObjectId(commentId)})
         return res
             .status(200)
             .json(
                 new ApiResponse(
                     200,
                     {},
                     "dislike comment"
                 )
             )
     }else{
         const commentLike = await Like.create(
             {
                 likedBy,
                 comment: new mongoose.Types.ObjectId(commentId)
             }
         )
     if(!commentLike){
         throw new ApiError(400,"something went wrong to like a comment")
     }
     return res
         .status(200).json(
             new ApiResponse(200,{},"liked a comment")
         )
     }
   
})
const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!tweetId){
        new ApiError(400,"tweetId is required")
    }
    if(!isValidObjectId(tweetId)){
        new ApiError(400,"tweetId is required")
    }
    const likedBy = req?.user?._id
    if(!likedBy){
        new ApiError(400,"tweetId is required")
    }

    const isTweetLike = await Like.findOne({likedBy,tweet:tweetId})
    
    if(isTweetLike){
        await Like.deleteOne({likedBy,toggleTweetLike})

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "dislike tweet"
            )
        )
    }else{
        const tweetLike = await Like.create({likedBy,tweet:tweetId})
        if(!tweetLike){
            throw new ApiError(500,"unable to like a tweet now")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200,{tweetLike},"like a tweet")
        )
    }
}
)
const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedBy = req.user?._id
    if(!likedBy){
        throw new ApiError(403,"user must logged in")
    }
    const likedVideos = await Like.aggregate([
        {
            $match:{
               likedBy:likedBy,
               video:{$exists: true,$ne:null}
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"videoDetails"
            }
        },
        
        {
            $project:{
                videoDetails: {$arrayElemAt:["$videoDetails",0]}
            }
        },
        {
            $project:{
                videoUrl:"$videoDetails.videoUrl",
                views:"$videoDetails.duration",
                title:"$videoDetails.title",
                views:"$videoDetails.views",
                duration:"$videoDetails.duration",
            }
        }
    ])
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likedVideos,
                "videos details fetched successfully"
            )
        )
})
module.exports = {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}