const {mongoose,Schema }= require("mongoose")
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2")
const Comment = require("./comments.model.js")
const Like = require("./likes.model.js")
const videoSchema = Schema({
    videoUrl:{
        type:String, //cloudinary url
        required:true,
    },
    thumbnail:{
        type:String, //cloudinary url 
        required:true,
    },
    title:{
        type:String, 
        required:true,
    },
    description:{
        type:String, 
        required:true,
    },
    duration:{
        type:Number,
        required:true
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

videoSchema.post('deleteOne', async (next)=>{
    await Comment.deleteMany({video: mongoose.Schema.Types.ObjectId(this._id)})
    await Like.deleteMany({video: mongoose.Schema.Types.ObjectId(this._id)})
    next()
})

videoSchema.plugin(mongooseAggregatePaginate)
const Video = mongoose.model("Video",videoSchema)
module.exports = Video