const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema({
  // filename:String,n
  // originalname: String,
  // path: String,
  img: {
    type: String,
  },
  title: String,
  title1: String
  
});
module.exports = mongoose.model("Event", partnerSchema);
