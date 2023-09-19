const mongoose = require("mongoose");

const RuleSchema = new mongoose.Schema({
  content: {
    type: String,
    default: null,
  },
  contentEN: {
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

const RuleModel = mongoose.model("rule", RuleSchema);
module.exports = RuleModel;
