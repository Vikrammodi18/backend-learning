const Comment = require("../models/comments.model.js")
const asyncHandler = require("../utils/asyncHandler.js")
const ApiError = require("../utils/apiError.js")
const ApiResponse = require("../utils/apiResponse.js")
const {mongoose,isValidObjectId} = require("mongoose")

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {page = 1, limit = 10} = req.query
    
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
module.exports = {
    getVideoComments,
    addComment,
}