const {Router} = require('express')
const {verifyJWT} = require('../middlewares/auth.middleware.js')
const router = Router()
const{toggleVideoLike} = require('../controllers/like.controller')
router.route('/:videoId/likeVideo').get(verifyJWT,toggleVideoLike)



module.exports = router