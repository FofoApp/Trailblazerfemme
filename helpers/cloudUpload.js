const { cloudinary } = require("./cloudinary");

exports.cloudinaryImageUploadMethod = async (files) => {
    return new Promise(resolve => {
        files.map(element => {
            
            cloudinary.uploader.upload(element?.path , (err, { secure_url, public_id}) => {
            
              if (err) {
                throw new Error("upload image error")
              }
    
              resolve({ secure_url, public_id })
    
              }
            ) 
            
        });
    })
  }