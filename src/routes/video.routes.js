const {Router} = require("express")
const {verifyJWT} = require("../middlewares/auth.middleware.js")
const upload = require('../middlewares/multer.middleware.js')
const router = Router()
const {videoUpload,getVideoById,updateVideo,getAllVideos} = require('../controllers/video.controller.js')

router.route('/videoUpload').post(verifyJWT,upload.fields([
                                                    {
                                                        name:"video",
                                                        maxfile:1
                                                    },
                                                    {
                                                        name:"thumbnail",
                                                        maxfile:1
                                                    }
                                                ]),
                                                videoUpload)
                                                
router.route('/:videoId/updateVideo').patch(verifyJWT,upload.single("thumbnail"),updateVideo)
router.route('/:videoId/getVideo').get(getVideoById)
router.route("/getAllVideo").get(getAllVideos)
router.route("/:videoId/deleteVideo").get(deleteVideo)
module.exports = router