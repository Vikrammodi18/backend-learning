const {Router} = require("express")
const {verifyJWT} = require("../middlewares/auth.middleware.js")
const upload = require('../middlewares/multer.middleware.js')
const router = Router()
const {videoUpload,getVideoById} = require('../controllers/video.controller.js')

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
router.route('/getVideo/:videoId').get(getVideoById)
module.exports = router