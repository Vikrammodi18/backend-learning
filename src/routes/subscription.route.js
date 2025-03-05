const {Router} = require("express")
const router = Router()
const {
    toggleSubscription,
    getUserChannelSubscribe,
    getSubscribedChannels
} = require("../controllers/subscription.controller.js")
const { verifyJWT } = require("../middlewares/auth.middleware.js")

router.route("/:channelId/subscribe").get(verifyJWT,toggleSubscription)
router.route("/:channelId/allSubscriber").get(getUserChannelSubscribe)
router.route("/:subscriberId/subscribedChannels").get(verifyJWT,getSubscribedChannels)
module.exports = router