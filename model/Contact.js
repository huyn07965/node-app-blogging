const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema({
  content: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  //   updatedAt: {
  //     type: Date,
  //     default: Date.now(),
  //   },
});

const ContactModel = mongoose.model("contact", ContactSchema);
module.exports = ContactModel;
