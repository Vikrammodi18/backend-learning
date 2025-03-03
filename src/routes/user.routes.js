const {Router} = require("express")
const upload = require('../middlewares/multer.middleware.js')
const{  registerUser,
        loginUser,
        logoutUser,
        refreshAccessToken,
        changeCurrentPassword,
        getCurrentUser,
        updateAccountDetails,
        updateCoverImage,
        updateAvatar,
        getUserChannelProfile,
        getWatchedHistory,
    } = require("../controllers/user.controller.js")
const{verifyJWT} = require("../middlewares/auth.middleware.js")
const router = Router()


router.route('/register').post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)
router.route('/login').post(loginUser)
router.route('/logout').post(verifyJWT,logoutUser)
router.route('/refreshToken').post(refreshAccessToken)
router.route('/changePassword').post(verifyJWT,changeCurrentPassword)
router.route('/getCurrentUser').get(verifyJWT,getCurrentUser)
router.route('/updateAccountDetails').patch(verifyJWT,updateAccountDetails)
router.route('/updateAvatar').post(verifyJWT,upload.single("avatar"),updateAvatar)
router.route('/updateCoverImage').post(verifyJWT,upload.single("coverImage"),updateCoverImage)
router.route('/c/:username').get(verifyJWT,getUserChannelProfile)
router.route('/history').get(verifyJWT,getWatchedHistory)
module.exports = router
