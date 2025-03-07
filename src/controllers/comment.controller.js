const Comment = require("../models/comments.model.js")
const asyncHandler = require("../utils/asyncHandler.js")
const ApiError = require("../utils/apiError.js")
const ApiResponse = require("../utils/apiResponse.js")
const {mongoose,isValidObjectId} = require("mongoose")

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {page = 1, limit = 10} = req.query
    if(page<1){
        throw new ApiError(400,"page start from 1")
    }
    const {videoId} = req.params;
    if(!videoId){
        throw new ApiError(400,"videoId are required")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"videoId are required")
    }
    const comments = await Comment.aggregate([
         {
            $match:{
                video: new mongoose.Types.ObjectId(videoId)
            }
         },
         {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                pipeline:[
                {
                      $project:{
                        username:1,
                        avatar:1,
                        createdAt:1
                    }
                },
                ],
                as:"owner"
            }
         },
         {
           $set:{
                owner:{$arrayElemAt:["$owner",0]}
           }
         },
         {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"comment",
                as:"likedComment"
            }
         },
         {
            $addFields:{
                numberOfLikes:{$size:"$likedComment"}
            }
         },
         {
            $project:{
                content:1,
                owner:1,
                numberOfLikes:1
            }
         }
    ])
    return res
        .status(200)
        .json(
            new ApiResponse(200,comments,"comments fetched successfully")
        )
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video Id")
    }
    const{content} = req.body;
  
    if(!videoId){
        throw new ApiError(400,"video Id is required")
    }
    if((!content || content.trim()==="")){
        throw new ApiError(400,"comment can not be empty")
    }
    
    const comment = await Comment.create(
        {
            video:new mongoose.Types.ObjectId(videoId),
            owner:req.user?._id,
            content
        }
    )
    console.log(comment)
    if(!comment){
        throw new ApiError(500,"there is an error while posting an comment")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                comment,
                "comment posted successfully"
            )
        )
})
const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params;
    const{content} = req.body;
    if(!content || content.trim("")===""){
        throw new ApiError(400,"comment can not empty")
    }
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid comment Id")
    }
    if(!commentId){
        throw new ApiError(400,"comment id is required")
    };
    const comment = await Comment.findOneAndUpdate(
        {
            _id:new mongoose.Types.ObjectId(commentId),
            owner:req.user?._id
        },
        {
            $set:{
                content:content
            }
        },
        {
           new:true
        }
    )
   
    if(!comment){
        throw new ApiError(400,"something went wrong while fetch!!");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200,comment,"successfully comment update:")
        )
})
module.exports = {
    getVideoComments,
    addComment,
    updateComment

}