const multer = require("multer");
const path = require("path");

// Multer config
module.exports = multer({
  storage: multer.diskStorage({
    
    // destination: function (req, file, cb) {
    //     cb(null, './public/uploads')
    //   },
    
    limits: { fileSize: 2 * 1024 * 1024 },
    
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname); 
        if(file.mimetype !== 'image/jpeg' || file.mimetype !== 'image/jpg' || file.mimetype !== 'image/png') {
            cb(new Error("File type is not supported"), false);
          return;
        }
        if (ext !== ".jpg" || ext !== ".jpeg" || ext !== ".png") {
          cb(new Error("File type is not supported"), false);
          return;
        }
        if (file.size > 2 * 1024 * 1024) {
          cb(new Error("File size cannot be higher than 2mb"), false);
          return;
        }
        cb(null, true);
      },

      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null,  uniqueSuffix + '-' + file.fieldname + path.extname(file.originalname) )
      },

  }),

});