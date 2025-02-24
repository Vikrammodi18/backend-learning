const {mongoose,Schema }= require("mongoose")
const mongooseAggregatePaginate = require(" mongoose-aggregate-paginate-v2")

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
        type:String, //cloudinary url
        required:true,
    },
    description:{
        type:String, //cloudinary url
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


videoSchema.plugin(mongooseAggregatePaginate)
const Video = mongoose.model("Video",videoSchema)
module.exports = Video