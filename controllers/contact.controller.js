const Contact = require("../models/contact.model");

console.log(Contact);

const getAllContact = async (req, res) => {
  try {
    const contact = await Contact.find();
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getSingleContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.ID);
    res.json(contact);
    if (!contact) {
      return res.status(404).json({ msg: "not found cousre your my love" });
    }
  } catch (error) {
    return res.status(400).json({ msg: "invaild cousre your my love" });
  }
  // const ID = +req.params.ID
  // const course = Course.find((courses)=>courses.id === ID)
};
const createContact = async (req, res) => {
  const newContact = new Contact(req.body);
  await newContact.save();
  res.status(201).json(newContact);
};
const updateContact = async (req, res) => {
  const ID = req.params.ID;
  try {
    // const updateCourse = await Course.findByIdAndUpdate(ID,{$set:{...req.body}});
    const updateContact = await Contact.findByIdAndUpdate(
      { _id: ID },
      { $set: { ...req.body } }
    );

    return res.status(200).json(updateContact);
  } catch (error) {
    return res.status(404).json({ msg: error });
  }
};
const deleteContact = async (req, res) => {
  // const ID = +req.params.ID
  // Course = Course.filter((course)=> Course.id !== ID)
  const deleteContact = await Contact.deleteOne({ _id: req.params.ID });
  res
    .status(200)
    .json({ secuss: true, msg: "this is deleted", contact: deleteContact });
};

module.exports = {
  getAllContact,
  getSingleContact,
  createContact,
  updateContact,
  deleteContact,
};
