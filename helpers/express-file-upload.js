const fileUpload = require('express-fileupload');


app.use(fileUpload({
      useTempFiles: true,
      tempFileDir: path.join(__dirname, 'tmp'),
      createParentPath: true,
      limits: { fileSize: 50 * 1024 * 1024 },
}))


const uploadFile = () => {
    const file = req.files.profileImage;
    const filename = new Date().getTime().toString() + path.extname(file.name);
    const savePath = path.join(__dirname, 'public', 'uploads', filename);
    if(file.truncated) {
        return res.status(401).send({message: "File size is too large"})
        
    }

    await file.mv(savePath);
}


module.exports = uploadFile;