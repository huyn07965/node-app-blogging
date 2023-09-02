const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  avatar: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    default: "",
  },
  fullName: {
    type: String,
    default: "",
  },
  userName: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    default: "",
  },
  status: {
    type: Number,
    default: "",
  },
  hot: {
    type: Number,
    default: "",
  },
  role: {
    type: Number,
    default: "",
  },
  slug: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
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
