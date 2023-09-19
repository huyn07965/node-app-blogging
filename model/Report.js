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
  reasonEN: {
    type: Array,
    default: [],
  },
  description: {
    type: String,
    default: "",
  },
  descriptionEN: {
    type: String,
    default: "",
  },
  status: {
    type: Number,
    default: 2,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const ReportModel = mongoose.model("report", ReportSchema);
module.exports = ReportModel;
