const { boolean } = require("joi");
const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  UserReceive: {
    type: String,
    default: null,
  },
  userId: {
    type: String,
    default: null,
  },
  postId: {
    type: String,
    default: null,
  },
  content: {
    type: String,
    default: null,
  },
  contentEN: {
    type: String,
    default: null,
  },
  class: {
    type: String,
    default: null,
  },
  seen: {
    type: Boolean,
    default: false,
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

const NotificationModel = mongoose.model("notification", NotificationSchema);
module.exports = NotificationModel;
