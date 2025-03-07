const {Router} = require("express")
const router = Router()
const {
    getVideoComments,
    addComment
} = require("../controllers/comment.controller.js")
const { verifyJWT } = require("../middlewares/auth.middleware.js")

router.route("/:videoId").post(verifyJWT,addComment)

module.exports = router
