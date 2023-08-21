const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const CommentSchema = new mongoose.Schema({
  idReply: {
    type: String,
    default: "null",
  },
  idPost: {
    type: String,
    default: "null",
  },
  idUser: {
    type: String,
    default: "null",
  },
  idUserReply: {
    type: String,
    default: "null",
  },

  content: {
    type: String,
    default: "null",
  },

  like: {
    type: Array,
    default: [],
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

const CommentModel = mongoose.model("comment", CommentSchema);
module.exports = CommentModel;
