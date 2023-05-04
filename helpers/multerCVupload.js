const multer = require('multer');
const path = require("path");

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/uploads')
    },
    filename: function(req, file, cb) {
        // cb(null,  Date.now() + "_" + file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      
        cb(null,  uniqueSuffix + '-' + file.fieldname + path.extname(file.originalname) )
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'application/pdf' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.mimetype === 'application/msword') {
        cb(null, true)
    }else {
        cb({ message: "Unsupported file type"}, false);
    }
}


const uploadCv = multer({
    storage:storage,
    limits: { fileSize: 1024 * 1024 },
    fileFilter: fileFilter

});




module.exports = uploadCv

