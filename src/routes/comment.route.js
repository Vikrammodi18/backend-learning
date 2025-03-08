const {Router} = require("express")
const router = Router()
const {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
} = require("../controllers/comment.controller.js")
const { verifyJWT } = require("../middlewares/auth.middleware.js")

router.route("/:videoId/allComments").get(getVideoComments)
router.route("/:videoId").post(verifyJWT,addComment)
router.route("/:commentId/updateComment").post(verifyJWT,updateComment)
router.route("/:commentId").get(verifyJWT,deleteComment)
module.exports = router
