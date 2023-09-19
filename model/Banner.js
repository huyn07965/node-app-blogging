const mongoose = require("mongoose");

const BannerSchema = new mongoose.Schema({
  title: {
    type: String,
    default: null,
  },
  titleEN: {
    type: String,
    default: null,
  },

  image: {
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

const BannerModel = mongoose.model("banner", BannerSchema);
module.exports = BannerModel;
