const {Router} = require('express')
const {verifyJWT} = require('../middlewares/auth.middleware.js')
const router = Router()
const{
    toggleVideoLike,
    toggleCommentLike ,
    toggleTweetLike,
    getLikedVideos
}  = require('../controllers/like.controller')

router.route('/:videoId/likeVideo').get(verifyJWT,toggleVideoLike)
router.route('/:commentId/likeComment').get(verifyJWT,toggleCommentLike )
router.route('/:tweetId/likeTweet').get(verifyJWT,toggleTweetLike)
router.route("/likedVideos").get(verifyJWT,getLikedVideos)
module.exports = router