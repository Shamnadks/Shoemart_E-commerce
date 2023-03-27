
const multer=require("multer")
const path = require('path');
const imageTypes = /jpeg|jpg|png|gif|svg|webp/;

//set storage
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images')
    },
    filename: (req, file, cb) => {
        let ext = path.extname(file.originalname)
        cb(null, file.fieldname + '-' + Date.now() + ext)
    }
})

module.exports = multer({ storage: storage, fileFilter:function(req,file,cb){
    const extname = imageTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype =imageTypes.test(file.mimetype);
    if(extname && mimetype){
      return cb(null,true);
    }
    else{
      return cb(new Error('Only image files are allowed'));     
    }
  },
//   onError: function (err, next) {
//     // Render your error page or redirect to a different page
//     res.render('error', { message: err.message });
//   }
}); 
 