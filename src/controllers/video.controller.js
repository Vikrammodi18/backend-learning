const Video = require("../models/videos.model")
const asyncHandler = require('../utils/asyncHandler.js')
const ApiError = require('../utils/apiError.js')
const {mongoose,isValidObjectId} = require("mongoose")
const ApiResponse = require('../utils/apiResponse.js')
const {uploadOnCloudinary,uploadVideoOnCloudinary,deleteVideoOnCloudinary} = require('../utils/cloudinary.js')
const { findByIdAndDelete } = require("../models/users.model.js")

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
            views:1,
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
    
    const{description,title} = req.body;
    
    if(!videoId){
        throw new ApiError(402,"videoId can't be empty") 
    }
    let responseThumbnail;
    console.log(req.file?.path)
    if(!req.file?.path){
        responseThumbnail = await uploadOnCloudinary(req.file?.path)
    }
    const existedVideo = await Video.findById(req.params?.videoId).select("title thumbnail description")
    console.log(existedVideo)
    if(!existedVideo){
        throw new ApiError(404,"video does not exist")
    }
    const video = await Video.findByIdAndUpdate(videoId,
        {
            $set:
            {
                description: description || existedVideo.description,
                title:title||existedVideo.title,
                thumbnail: responseThumbnail?.url || existedVideo.thumbnail
            },
    
        },{new:true}).select("videoUrl thumbnail title description ")
        console.log(video)
    if(!video){
        throw new ApiError(402,"video is not available") 
    }
  

    return res.status(200)
              .json(
                new ApiResponse(200,
                    video,"updated successfully"
                )
              )
    
})
const getAllVideos = asyncHandler(async (req,res)=>{
    try {
        const{ page = 1,
            limit = 10,
            sortBy,
            sortType,
            
        } = req.query
        //build sort objec
        const sortObject = {}
        sortObject[sortBy] = sortType === "desc"? -1 :1;
        
        
        //get total count for pagination
        const totalVideo = await Video.countDocuments({})
       
         
 
         // Get paginated videos with owner details 
         const video = await Video.aggregate([
             {
                 $lookup:{
                     from:"users",
                     localField:"owner",
                     foreignField:"_id",
                     as:"owner",
                     pipeline:[
                         {
                             $project:{
                                 username:1,
                                 fullName:1,
                                 avatar:1
                             }
                         }
                     ]
                 }
             },
             {$unwind:"$owner"},
             {$sort: sortObject},
             {$skip:(Number(page)-1)*Number(limit)},
             {$limit: Number(limit)}
         ]);
 
     const totalPages = Math.ceil(totalVideo/ Number(limit))
     
     
     res.status(200).json(
         new ApiResponse(200,{
             video,
             pagination:{
                 page:Number(page),
                 limit: Number(limit),
                 totalPages,
                 totalVideo,
                 hasNextPage: Number(page)<totalPages,
                 hasPrevPage:Number(page)>1
             },
         },"videos fetched successfully")
     )
     
   } catch (error) {
    throw new ApiError(500, "Failed to fetch videos")
   }


})
const deleteVideo = asyncHandler(async (req,res)=>{
    const{videoId} = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(402,"Invalid Video Id")
    }
    if(!videoId){
        throw new ApiError(400,"video Id is required")
    }
    const response = await findByIdAndDelete(videoId)
    await deleteVideoOnCloudinary(response.videoUrl)
    if(!response){
        throw new ApiError(500,"video did not delete")
    }
    return res.status(200)
            .json(
                new ApiResponse(200,{},"video deleted successfully")
            )
})
module.exports = {
    videoUpload,
    getVideoById,
    updateVideo,
    getAllVideos,
    deleteVideo,
}