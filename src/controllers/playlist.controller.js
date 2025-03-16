const { isValidObjectId,mongoose } = require('mongoose')
const Playlist = require('../models/playlist.model.js')
const ApiError = require('../utils/apiError.js')
const ApiResponse = require('../utils/apiResponse.js')
const asyncHandler = require('../utils/asyncHandler.js')
const Video = require('../models/videos.model.js')



const createPlaylist = asyncHandler(async (req, res) => {
     //TODO: create playlist
    //take name and description of playlist
    //validate name and description
    //create an empty space to store videos
    const {name, description} = req.body
    if((!name || !description) && (name.trim() === "")){
        throw new ApiError(400,"Name and Description of playlist are required")
    }
   let videos = []
   const playlist = await Playlist.create({
    name,
    description,
    owner:req.user?._id,
    videos
   })
   return res
   .status(400)
   .json(
    new ApiResponse(
        200,
        playlist,
        "playlist is created"
    )
   )
})
const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"valid user Id is required!!")
    }
    const allPlaylist = await Playlist.findOne({owner:userId}).populate("videos")
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            allPlaylist,
            "all playlist fetched:"
        )
    )
})
const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
})
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    //get playlistId and videoId
    //validate playlistId and videoId
    //check playlist exist or not
    //check video exist or not
    //check user is owner or not
    //upload video on playlist
    const {playlistId, videoId} = req.params
    if(!playlistId){
        throw new ApiError(400,"playlist Id is required")
    }
    if(!videoId){
        throw new ApiError(400,"playlist Id is required")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video Id")
    }
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist Id")
    }
    const existPlaylist = await Playlist.findById(playlistId)
    if(!existPlaylist){
        throw new ApiError(404,"playlist does not exist")
    }
    if(existPlaylist.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403,"Unauthorised access")
    }
    const video = Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"video does not exist")
    }
    if(existPlaylist.videos.includes(videoId)){
        throw new ApiError(404,"video already exist")
    }
    
    existPlaylist.videos.push(videoId)
    await existPlaylist.save()
    return res
    .status(200)
    .json(
        new ApiResponse(200,existPlaylist,"video is published into playlist")
    )
})

module.exports = {
    createPlaylist,
    addVideoToPlaylist,
    getUserPlaylists,
}
