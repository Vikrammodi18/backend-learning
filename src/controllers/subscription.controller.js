const Subscription = require("../models/subscription.model");
const { mongoose,isValidObjectId } = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");

const toggleSubscription = asyncHandler(async (req, res) => {
    
  const { channelId } = req.params;
  if (!channelId) {
    throw new ApiError(400, "channel Id is required!!");
  }
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channelId");
  }
 
  try {
    const isSubscribe = await Subscription.findOne({
      subscriber: req.user?._id,
      channel: channelId,
    });
    if (isSubscribe) {
      await Subscription.deleteOne({ _id: isSubscribe?._id });
      return res
        .status(200)
        .json(
          new ApiResponse(200, { message: "unSubscribed" }, "unSubscribed")
        );
    } else {
      await Subscription.create({
          subscriber: req.user?._id,
        channel: channelId,
      });
      return res
        .status(200)
        .json(
          new ApiError(200, { message: "subscribed" }, "subscribed sucessfully")
        );
    }
  } catch (error) {
    throw new ApiError(
      400,
      error.message || "something went wrong at subscription"
    );
  }
});
// controller to return subscriber list of a channel
const getUserChannelSubscribe = asyncHandler(async (req, res) => {
    
  const { channelId } = req.params;
  if (!channelId) {
    throw new ApiError(400,"channelId is required")
  }
  if(!isValidObjectId(channelId)){
    throw new ApiError(400,"Invalid channel Id")
  }
  let subscriber
  try {
     subscriber = await Subscription.aggregate([
      {
          $match: {channel:new mongoose.Types.ObjectId(channelId)}
      },
      {
          $lookup:{
              from:"users",
              localField:"channel",
              foreignField:"_id",
              as:"subscriberDetails",
              pipeline:[{
                  $project:{
                      username:1,
                      
                      avatar:1,
                      
                  },
              }
              ],
          },
      },
      {
          $project:{
              subscriberDetails:1
          }
      },
      { $addFields: { subscriberDetails: { $first: "$subscriberDetails" } } },
    ])
  } catch (error) {
    throw new ApiError(500,error.message||"something went wrong in aggregation pipeline")
  }
  
  if(!subscriber){
    throw new ApiError(500,"there is issue on subscriber")
  }
  return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscriber,
                "subscriber Fetched successfully"
            )
        )
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    
    const { subscriberId } = req.params
    if(!subscriberId){
        throw new ApiError(404,"subscriber id are required!")
    }
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(404,"subscriber id are required!")

    }
    
    const channel = await Subscription.aggregate([
        {
            $match: {subscriber: new mongoose.Types.ObjectId(subscriberId)}
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"subscribedChannel",
                pipeline:[
                    {
                        $project:{
                            fullName:1,
                            username:1,
                            avatar:1,
                        }
                    }
                ]
            }
        },
        {
            $project:{
                subscribedChannel:1
            }
        },
        {
            $addFields:
            {
                subscribedChannel: {$first: "$subscribedChannel"}
            }}
    ])
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channel,
                "all subscribed channel by user"
            )
        )
})

module.exports = {
  toggleSubscription,
  getUserChannelSubscribe,
  getSubscribedChannels
};
