const {Router}= require("express")
const { verifyJWT } = require("../middlewares/auth.middleware")
const {
    createPlaylist,
    addVideoToPlaylist
} = require("../controllers/playlist.controller.js")
const router  = Router()
router.use(verifyJWT)
router.route('/').post(createPlaylist)
router.route('/:videoId/:playlistId').patch(addVideoToPlaylist)
module.exports = router