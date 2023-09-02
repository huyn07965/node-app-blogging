const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  idUser: {
    type: String,
    default: "",
  },
  idPost: {
    type: String,
    default: "",
  },
  idComment: {
    type: String,
    default: "",
  },
  reason: {
    type: Array,
    default: [],
  },
  content: {
    type: String,
    default: "",
  },
  active: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const ReportModel = mongoose.model("report", ReportSchema);
module.exports = ReportModel;
