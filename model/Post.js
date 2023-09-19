const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    default: null,
  },
  titleEN: {
    type: String,
    default: null,
  },
  slug: {
    type: String,
    default: null,
  },
  status: { type: Number, default: null },
  hot: { type: Boolean, default: null },
  image: {
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
  user: {
    type: Object,
    default: null,
  },
  category: {
    type: Object,
    default: null,
  },
  view: {
    type: Number,
    default: null,
  },
  like: {
    type: Number,
    default: 0,
  },
  save: {
    type: Number,
    default: 0,
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

const PostModel = mongoose.model("post", PostSchema);
module.exports = PostModel;
