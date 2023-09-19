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
  descriptionEN: {
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
  likeComment: {
    type: Array,
    default: [],
  },
  follow: {
    type: Array,
    default: [],
  },
  totalFollow: {
    type: Number,
    default: 0,
  },
  follower: {
    type: Array,
    default: [],
  },
  totalFollower: {
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

UserSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, {
    expiresIn: "7d",
  });
  return token;
};

const UserModel = mongoose.model("user", UserSchema);
module.exports = UserModel;
