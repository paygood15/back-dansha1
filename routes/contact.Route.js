//

const express = require("express");
const router = express.Router();

const contactController = require("../controllers/contact.controller");

// get All Courses
router.get("/", contactController.getAllContact);

// router.route("./")
//          .get(coursesController.getAllCourses)
//          .post(coursesController.createCourse)

//  GEt one Courses
router.get("/:ID", contactController.getSingleContact);

//create course
router.post("/", contactController.createContact);

// update
router.patch("/:ID", contactController.updateContact);

//del
router.delete("/:ID", contactController.deleteContact);

module.exports = router;
