const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  avatar: {
    type: String,
    default: "null",
  },
  email: {
    type: String,
    default: "null",
  },
  fullName: {
    type: String,
    default: "null",
  },
  userName: {
    type: String,
    default: "null",
  },
  password: {
    type: String,
    default: "null",
  },
  status: {
    type: Number,
    default: "null",
  },
  hot: {
    type: Number,
    default: "null",
  },
  role: {
    type: Number,
    default: "null",
  },
  slug: {
    type: String,
    default: "null",
  },
  description: {
    type: String,
    default: "null",
  },
  watchLater: {
    type: Array,
    default: [],
  },
  likePost: {
    type: Array,
    default: [],
  },
  follow: {
    type: Array,
    default: [],
  },
  follower: {
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

UserSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, {
    expiresIn: "1d",
  });
  return token;
};

const UserModel = mongoose.model("user", UserSchema);
module.exports = UserModel;
