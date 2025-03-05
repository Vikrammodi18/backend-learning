require('dotenv').config()
const { v2:cloudinary }= require("cloudinary")
const fs = require("fs")
cloudinary.config({ 
    cloud_name: `${process.env.CLOUDINARY_CLOUD_NAME}`, 
    api_key: `${process.env.CLOUDINARY_API_KEY}`, 
    api_secret: `${process.env.CLOUDINARY_API_SECRET}` 
});
const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath) return null
        //upload the file on cloudinary
       const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        // console.log("response:",response)
        fs.unlinkSync(localFilePath)
        //file has been uploaded successfull
        // console.log("file is uploaded on cloudinary",response.url)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload operation got failed
        return null
    }
}
const uploadVideoOnCloudinary = async(localFilePath)=>{
    try {
        if(!localFilePath) return null
      const response = await new Promise((resolve,reject)=>{
            cloudinary.uploader.upload_large(localFilePath,{
                 resource_type:"video",
                 chunk_size:10000000

        },(error,result)=>{
            if(error){
                reject(error)
            }
            resolve(result)
        });
      })
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload operation got failed
        return null
    }
}
const deleteVideoOnCloudinary = async (fileUrl)=>{
    try {
        if (!fileUrl) return null;
        const fileName =  fileUrl.split("/").slice(-1).join("").replace(".mp4","")
        // console.log(fileName)
        const response = await cloudinary.uploader.destroy(fileName,{resource_type:"video"})
    } catch (error) {
        throw new ApiError(500,error.message || "unable to delete")
    }
}

module.exports = {
    uploadOnCloudinary,
    uploadVideoOnCloudinary,
    deleteVideoOnCloudinary,
}