const {Router}= require("express")
const { verifyJWT } = require("../middlewares/auth.middleware")
const {
    createPlaylist,
    addVideoToPlaylist,
    getUserPlaylists
} = require("../controllers/playlist.controller.js")
const router  = Router()
router.use(verifyJWT)
router.route('/').post(createPlaylist)
router.route('/:videoId/:playlistId').patch(addVideoToPlaylist)
router.route("/:userId").get(getUserPlaylists)
module.exports = router