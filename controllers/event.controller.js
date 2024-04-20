const Event = require("../models/event.model");
// console.log({Partner}, "Event");

const getAllpartner = async (req, res) => {
  try {
    const partnerA = await Event.find();
    res.json(partnerA);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPartner = async (req, res) => {
  // const { filename, originalname, path } = req.file;
  // const { title } = req.body; // استخراج العنوان من الطلب

  try {
    const { img, title,title1 } = req.body;
    const savedPartner = await Event.create({ img, title,title1 });

    return res.status(201).json(savedPartner);
  } catch (error) {
    res.status(500).json({ error: "Failed to upload img", msg: error });
  }
};

const updatePartner = async (req, res) => {
  const { id } = req.params;
  const { img, title,title1 } = req.body;

  try {
    const updatedPartner = await Event.findByIdAndUpdate(
      id,
      { img, title,title1 },
      { new: true }
    );
    if (!updatedPartner) {
      return res.status(404).json({ error: "Partner not found" });
    }
    res.json(updatedPartner);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update partner", msg: error.message });
  }
};
const deletePartner = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPartner = await Event.findByIdAndDelete(id);
    if (!deletedPartner) {
      return res.status(404).json({ error: "Partner not found" });
    }
    res.json({ message: "Partner deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete partner", msg: error.message });
  }
};

module.exports = {
  getAllpartner,
  createPartner,
  updatePartner,
  deletePartner,
};

// app.post('/upload', upload.single('img'),
