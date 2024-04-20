const express = require("express")
const  router = express.Router();

const { v4: uuidv4} = require('uuid')
const multer = require('multer');


const partnerController = require("../controllers/partner.Controller")

const multerStorage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,"upload");
    },
    filename: function (req,file,cb) {
        const ext =file.mimetype.split("/")[1];
        const filename = `partner-${uuidv4()}-${Date.now()}.${ext}`;
        cb(null,`${filename}`);
        req.body.image = filename;

    }
})
const upload = multer({ storage: multerStorage }); // تحديد مسار حفظ الملفات

// get All Courses
router.get('/',partnerController.getAllpartner);

//create course 
router.post('/',upload.single('image'),partnerController.createPartner);
//update course 
router.put("/:id",upload.single('image'), partnerController.updatePartner);
//del course 
router.delete("/:id", partnerController.deletePartner);


module.exports = router ;
