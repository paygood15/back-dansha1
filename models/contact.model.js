const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  email: {
    type: String,
  },
  companyName: {
    type: String,
  },
  message: {
    type: String,
  },
});
module.exports = mongoose.model("Contact", contactSchema);
