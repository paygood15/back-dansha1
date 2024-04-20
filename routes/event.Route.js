const express = require("express")
const  router = express.Router();

const { v4: uuidv4} = require('uuid')
const multer = require('multer');

const authController = require("../controllers/authController"); // Change import to require


const partnerController = require("../controllers/event.controller")

const multerStorage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,"upload");
    },
    filename: function (req,file,cb) {
        const ext =file.mimetype.split("/")[1];
        const filename = `partner-${uuidv4()}-${Date.now()}.${ext}`;
        cb(null,`${filename}`);
        req.body.img = filename;

    }
})
const upload = multer({ storage: multerStorage }); // تحديد مسار حفظ الملفات

// get All Courses
router.get('/',partnerController.getAllpartner)

//create course 
router.post('/',upload.single('img'), authController.auth,
authController.allowedTo('admin', 'manager'),partnerController.createPartner)
//update course 
router.put("/:id",upload.single('img'), authController.auth,
authController.allowedTo('admin', 'manager'), partnerController.updatePartner);
//del course 
router.delete("/:id", authController.auth,
authController.allowedTo('admin', 'manager'), partnerController.deletePartner);



module.exports = router ;
