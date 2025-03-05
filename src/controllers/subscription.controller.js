const Subscription = require("../models/subscription.model")
const {isValidObjectId}= require("mongoose")
const asyncHandler = require("../utils/asyncHandler")
const ApiError = require("../utils/apiError")
const ApiResponse = require("../utils/apiResponse")

const toggleSubscription  = asyncHandler(async (req,res)=>{
    const {channelId} = req.params
    if(!channelId){
        throw new ApiError(400,"channel Id is required!!")
    }
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channelId")
    }
    try {
        const isSubscribe = await Subscription.findOne(
            {
                subscriber:req.user?._id,
                channel:channelId
        })
        if(isSubscribe){
            await Subscription.deleteOne({_id:isSubscribe?._id})
            return res
                    .status(200)
                    .json(
                        new ApiResponse(200,{"message":"unSubscribed"},"unSubscribed")
                    )
        }
        else{
            await Subscription.create({
                channel:channelId,
                subscriber:req.user?._id
            })
            return res
                    .status(200)
                    .json(
                        new ApiError(200,{"message":"subscribed"},"subscribed sucessfully")
                    )
        }
    } catch (error) {
        throw new ApiError(400, error.message|| "something went wrong at subscription")
    }

})
module.exports = {
    toggleSubscription,
}