const Video = require("../models/videos.model")
const asyncHandler = require('../utils/asyncHandler.js')
const ApiError = require('../utils/apiError.js')
const mongoose = require("mongoose")
const ApiResponse = require('../utils/apiResponse.js')
const {uploadOnCloudinary,uploadVideoOnCloudinary} = require('../utils/cloudinary.js')

const videoUpload = asyncHandler(async (req,res)=>{
    const{description,title} = req.body
    if(!description || !title){
        throw new ApiError(400,"description and title can not be empty")
    }
    console.log(req.files)
   const videoPath = req.files?.video[0]?.path
   const thumbnailPath = req.files?.thumbnail[0]?.path
    if(!videoPath){
        throw new ApiError(400,"video is not uploaded properly")
    }
    
    if(!thumbnailPath){
        throw new ApiError(400,"thumbnail is not uploaded properly")
    }
   const videoUploadedResponse = await uploadVideoOnCloudinary(videoPath)
   console.log(videoUploadedResponse)
   const thumbnailUploadedResponse = await uploadOnCloudinary(thumbnailPath)
   if(!videoUploadedResponse){
        throw new ApiError(400,"video is not uploaded at cloud")
    }
   if(!thumbnailUploadedResponse){
        throw new ApiError(400,"thumbnail is not uploaded at cloud")
    }
    const duration = videoUploadedResponse.duration
    const videoUrl = videoUploadedResponse.url;
    console.log(req.user?.username)
    const video = await Video.create({
        title,
        description,
        videoUrl:videoUrl,
        duration:duration,
        thumbnail:thumbnailUploadedResponse.url,
        owner:req.user?._id
    })

        res.status(200)
        .json(
            new ApiResponse(200,video,"video is uploaded")
        )

//    const video = await Video.create({
//         title,
//         description,
//         videoUrl: videoUploadedResponse?.path;
//         thumbnail:thumbnailUploadedResponse?.path;

//    })
})

const getVideoById = asyncHandler(async (req,res)=>{
    const{videoId} = req.params
    if(!videoId){
        throw new ApiError(400,"video id is not there")
    }
    const video = await Video.aggregate([
    {
        $match:{
            _id:new mongoose.Types.ObjectId(videoId),
            }
    },
        {
        $lookup:{
            from:"likes",
            localField:"_id",
            foreignField:"video",
            as:"like"
        }
    },
    {
        $lookup:{
            from:"comments",
            localField:"_id",
            foreignField:"video",
            as:"comments"
        }
    },
       {
        $addFields:{
            likes:{
                $size:"$like"
            },
            totalComments:{
                $size:"$comments"
            }
        },
    },
        {
            $project:{
            likes:1,
            totalComments:1,
            videoUrl:1,
            title:1,
            thumbnail:1,
            description:1,
            owner:1,
            duration:1
        }
    }
    ])
    
    
    if(!video?.length){
        throw new ApiError(404,"video does not exist")
    }
    return res.status(200)
                .json(
                    new ApiResponse(200,video[0],"video is fetched successfully")
                )
})
const updateVideo = asyncHandler(async (req,res)=>{
    const {videoId} = req.params;
    console.log(videoId)
    const{description,title} = req.body;
    
    if(!videoId){
        throw new ApiError(402,"videoId can't be empty") 
    }
    console.log(req.file.path)
    const thumbnailPath = req.file?.path
    if(!thumbnailPath){
        throw new ApiError(402,"thumbnail did not uploaded") 
    }
    
    const responseThumbnail = await uploadOnCloudinary(thumbnailPath)
    if(!responseThumbnail){
        throw new ApiError(401,"something went wrong at cloud while uploading")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(402,"video is not available") 
    }
    video.description = description;
    video.title = title;
    video.thumbnail = responseThumbnail?.url;
    await video.save()
    return res.status(200)
              .json(
                new ApiResponse(200,
                    {},"updated successfully"
                )
              )
    
})
module.exports = {
    videoUpload,
    getVideoById,
    updateVideo,
}