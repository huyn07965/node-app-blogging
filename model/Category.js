const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    default: null,
  },
  slug: {
    type: String,
    default: null,
  },
  status: {
    type: Number,
    default: 2,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  // image: String,
  //   createdAt: {
  //     type: Date,
  //     default: Date.now(),
  //   },
  //   updatedAt: {
  //     type: Date,
  //     default: Date.now(),
  //   },
});

const CategoryModel = mongoose.model("category", CategorySchema);
module.exports = CategoryModel;
