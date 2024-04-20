const mongoose = require("mongoose")

const partnerSchema = new mongoose.Schema({
    // filename:String,n
    // originalname: String,
    // path: String,
    image: {
        type:String
    },
    title:String
});
module.exports =  mongoose.model('Partner',partnerSchema)