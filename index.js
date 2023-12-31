require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const unidecode = require("unidecode");
const UserModel = require("./model/User");
const CommentModel = require("./model/Comment");
const CategoryModel = require("./model/Category");
const PostModel = require("./model/Post");
const ContactModel = require("./model/Contact");
const RuleModel = require("./model/Rules");
const ReportModel = require("./model/Report");
const NotificationModel = require("./model/Notification");
const BannerSchema = require("./model/Banner");
const userRoutes = require("./routes/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const natural = require("natural");
const BannerModel = require("./model/Banner");
const classifier = new natural.BayesClassifier();
const moment = require("moment");

const app = express();
const http = require("http").createServer(app);
const socketIo = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});
app.use(express.json());
app.use(cors());
// app.use(cors({ origin: "https://react-app-blogging.onrender.com" }));
app.use(express.static("public"));
// const server = http.createServer(app);
// const io = socketIo(server);

socketIo.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

mongoose.connect(process.env.MONGODB_CONNECT_URI);
mongoose.set("strictQuery", true);

// mongoose.connect("mongodb://127.0.0.1:27017/node_crud");

//upload image
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/Images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({
  storage: storage,
});

// Send mail

// Thiết lập thông tin email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "huynguyen20521@gmail.com", //generated by Mailtrap
    pass: "zmaxykcjylpfrrss", //generated by Mailtrap
  },
});

//API connect Front-end
const tempStorage = {};

app.get("/send-otp/:email", (req, res) => {
  const email = req.params.email;
  const otp = Math.floor(100000 + Math.random() * 900000);

  tempStorage[email] = otp;

  const mailOptions = {
    from: "huynguyen20521@gmail.com",
    to: `${email}`,
    subject: "Mã OTP cho việc đặt lại mật khẩu",
    text: `Mã OTP của bạn là: ${otp}`,
  };
  // Gửi email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Lỗi khi gửi email:", error);
      res.status(500).send("Lỗi khi gửi email");
    } else {
      console.log("Email đã được gửi:", info.response);
      res.status(200).send("Mã OTP đã được gửi qua email");
    }
  });
});

// Thay doi

// app.get("/verify-otp", async (req, res) => {
//   const { email, otp } = req.query;

//   if (tempStorage[email] && tempStorage[email] == otp) {
//     delete tempStorage[email];
//     const user = await UserModel.findOneAndUpdate(
//       { email: email },
//       {
//         password: "",
//       }
//     );
//     if (user) {
//       res.status(200).send("Thông tin người dùng đã được cập nhật");
//     } else {
//       res.status(404).send("Không tìm thấy người dùng");
//     }
//     console.log("Mã OTP hợp lệ");
//   } else {
//     console.log("Mã OTP không hợp lệ");
//   }
// });

app.get("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.query;

    if (tempStorage[email] && tempStorage[email] == otp) {
      delete tempStorage[email];
      const user = await UserModel.findOneAndUpdate(
        { email: email },
        {
          password: "",
        }
      );
      if (user) {
        res.status(200).send("Thông tin người dùng đã được cập nhật");
      } else {
        res.status(404).send("Không tìm thấy người dùng");
      }
      console.log("Mã OTP hợp lệ");
    } else {
      console.log("Mã OTP không hợp lệ");
      res.status(400).send("Mã OTP không hợp lệ");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Lỗi server");
  }
});

// thay doi

// app.put("/changePass", async (req, res) => {
//   const email = req.query.email;
//   const salt = await bcrypt.genSalt(Number(process.env.SALT));
//   const hashPassword = await bcrypt.hash(req.body.password, salt);
//   UserModel.findOneAndUpdate(
//     { email: email },
//     {
//       password: hashPassword,
//     }
//   )
//     .then((users) => res.json(users))
//     .catch((err) => res.json(err));
// });

app.put("/changePass", async (req, res) => {
  try {
    const email = req.query.email;
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const updatedUser = await UserModel.findOneAndUpdate(
      { email: email },
      {
        password: hashPassword,
      },
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    res.json(err);
  }
});

app.get("/auth", (req, res) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  const decodedToken = jwt.verify(token, process.env.JWTPRIVATEKEY);
  const userId = decodedToken._id;
  UserModel.findById({ _id: userId })
    .then((user) => {
      // if (!user) {
      //   return res.status(404).json({ error: "Không tìm thấy người dùng" });
      // }
      res.json(user);
    })
    .catch((err) => res.json(err));
});

app.post("/login", async (req, res) => {
  UserModel.findOne({ email: req.body.email })
    .then((user) => {
      bcrypt
        .compare(req.body.password, user.password)
        .then((isPasswordValid) => {
          if (isPasswordValid) {
            // const accessToken = jwt.sign({ userId: user.id },
            // const accessToken = generateAccessToken(response._id, role)
            // return res.status(401).json({ error: "Mật khẩu không đúng" });
            const token = user.generateAuthToken();
            res
              .status(200)
              .send({ data: token, message: "logged in successfully" });
          } else {
            res.status(500).json({ error: "Đã xảy ra lỗi" });
          }
        })
        .catch((error) => {
          res.status(500).json({ error: "Đã xảy ra lỗi" });
        });
    })
    .catch((error) => {
      res.status(500).json({ error: "Đã xảy ra lỗi" });
    });
});

app.get("/user", (req, res) => {
  UserModel.find({})
    .sort({ createdAt: -1 })
    .then((users) => res.json(users))
    .catch((err) => res.json(err));
});
app.get("/getTotalAllUser", (req, res) => {
  UserModel.countDocuments({})
    .then((count) => res.json({ totalUser: count }))
    .catch((err) => res.json(err));
});

app.get("/userActive", (req, res) => {
  UserModel.find({ status: 1 })
    .sort({ createdAt: -1 })
    .then((users) => res.json(users))
    .catch((err) => res.json(err));
});

// Thay doi

// app.post("/createUser", upload.single("file"), async (req, res) => {
//   const salt = await bcrypt.genSalt(Number(process.env.SALT));
//   const hashPassword = await bcrypt.hash(req.body.password, salt);

//   const userIsValid = await UserModel.findOne({ email: req.body.email });
//   if (userIsValid) {
//     res.status(409).send("User with given email already exist");
//   } else {
//     UserModel.create({
//       avatar: req.body.avatar,
//       email: req.body.email,
//       fullName: req.body.fullName,
//       userName: req.body.userName,
//       password: hashPassword,
//       status: req.body.status,
//       hot: req.body.hot,
//       role: req.body.role,
//       slug: req.body.slug,
//       description: req.body.description,
//       watchLater: req.body.watchLater,
//       likePost: req.body.likePost,
//       follow: req.body.follow,
//       follower: req.body.follower,
//     })
//       .then((users) => res.json(users))
//       .catch((err) => res.json(err));
//   }
// });

app.post("/createUser", upload.single("file"), async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const userIsValid = await UserModel.findOne({ email: req.body.email });
    if (userIsValid) {
      return res.status(409).send("User with given email already exists");
    }

    const newUser = await UserModel.create({
      avatar: req.body.avatar,
      email: req.body.email,
      fullName: req.body.fullName,
      userName: req.body.userName,
      password: hashPassword,
      status: req.body.status,
      hot: req.body.hot,
      role: req.body.role,
      slug: req.body.slug,
      description: req.body.description,
      descriptionEN: req.body.descriptionEN,
      watchLater: req.body.watchLater,
      likePost: req.body.likePost,
      likeComment: [],
      follow: req.body.follow,
      totalFollow: 0,
      follower: req.body.follower,
      totalFollower: 0,
    });

    res.json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.get("/userFilter/:status", (req, res) => {
  const status = req.params.status;
  let query = {};
  if (status) {
    query = { status: status };
  }
  UserModel.find({ status: status })
    .sort({ createdAt: -1 })
    .then((user) => res.json(user))
    .catch((error) => res.status(500).json({ message: error.message }));
});

app.get("/getUserInMonth", (req, res) => {
  const startOfMonth = moment().startOf("month");
  const endOfMonth = moment().endOf("month");

  UserModel.countDocuments({
    createdAt: { $gte: startOfMonth.toDate(), $lte: endOfMonth.toDate() },
  })
    .then((count) => {
      res.json({ totalUser: count });
    })
    .catch((error) => {
      console.error("Error fetching number of posts:", error);
      res.status(500).json({ error: "Error Message: " + error });
    });
});

app.get("/getUser/:id", (req, res) => {
  const id = req.params.id;
  UserModel.findById({ _id: id })
    .then((users) => res.json(users))
    .catch((err) => res.json(err));
});

app.put("/updateUser/:id", (req, res) => {
  const id = req.params.id;
  UserModel.findByIdAndUpdate(
    { _id: id },
    {
      avatar: req.body.avatars,
      email: req.body.email,
      fullName: req.body.fullName,
      userName: req.body.userName,
      password: req.body.password,
      status: req.body.status,
      hot: req.body.hot,
      role: req.body.role,
      slug: req.body.slug,
      description: req.body.description,
      descriptionEN: req.body.descriptionEN,
      watchLater: req.body.watchLater,
      likePost: req.body.likePost,
      likeComment: req.body.likeComment,
      follow: req.body.follow,
      totalFollow: req.body.totalFollow,
      follower: req.body.follower,
      totalFollower: req.body.totalFollower,
    }
  )
    .then((users) => {
      socketIo.emit(
        "notification",
        req.body.totalFollow || req.body.totalFollower
      );

      PostModel.updateMany(
        { "user.id": id },
        { "user.slug": req.body.slug, "user.userName": req.body.userName }
      ).then((post) => {
        res.json({ users, post });
      });
    })
    .catch((err) => res.json(err));
});

app.delete("/deleteUser/:id", (req, res) => {
  const id = req.params.id;
  UserModel.findByIdAndDelete({ _id: id })
    .then((users) => {
      PostModel.updateMany({ "user.id": id }, { user: [] }).then((post) => {
        res.json({ users, post });
      });
    })
    .catch((err) => res.json(err));
});
app.delete("/deleteUserReject", (req, res) => {
  UserModel.deleteMany({ status: 3 })
    .then((users) => {
      PostModel.updateMany({ "user.id": id }, { user: [] }).then((post) => {
        res.json({ users, post });
      });
    })
    .catch((err) => res.json(err));
});

//API category

app.get("/category", (req, res) => {
  CategoryModel.find({ status: 1 })
    .sort({ createdAt: -1 })
    .then((category) => res.json(category))
    .catch((err) => res.json(err));
});
app.get("/getAllCategory", (req, res) => {
  CategoryModel.find({})
    .sort({ createdAt: -1 })
    .then((category) => res.json(category))
    .catch((err) => res.json(err));
});
app.get("/getCategoryFilter/:status", (req, res) => {
  const status = req.params.status;
  // let query = {};
  // if (status) {
  //   query = { status: status };
  // }

  CategoryModel.find({ status: status })
    .sort({ createdAt: -1 })
    .then((category) => res.json(category))
    .catch((err) => res.json(err));
});

app.post("/createCategory", (req, res) => {
  CategoryModel.create({
    name: req.body.name,
    nameEN: req.body.nameEN,
    slug: req.body.slug,
    status: req.body.status,
  })
    .then((category) => res.json(category))
    .catch((err) => res.json(err));
});

app.get("/getCategory/:id", (req, res) => {
  const id = req.params.id;
  CategoryModel.findById({ _id: id })
    .then((category) => res.json(category))
    .catch((err) => res.json(err));
});

app.put("/updateCategory/:id", (req, res) => {
  const id = req.params.id;
  CategoryModel.findByIdAndUpdate(
    { _id: id },
    {
      name: req.body.name,
      nameEN: req.body.nameEN,
      slug: req.body.slug,
      status: req.body.status,
    }
  )
    .then((category) => {
      PostModel.updateMany(
        { "category.id": id },
        {
          "category.slug": req.body.slug,
          "category.name": req.body.name,
          "category.nameEN": req.body.nameEN,
        }
      ).then((post) => {
        res.json({ category, post });
      });
    })
    .catch((err) => res.json(err));
});

app.delete("/deleteCategory/:id", (req, res) => {
  const id = req.params.id;
  CategoryModel.findByIdAndDelete({ _id: id })
    .then((category) => {
      PostModel.updateMany({ "category.id": id }, { category: [] }).then(
        (post) => {
          res.json({ category, post });
        }
      );
    })
    .catch((err) => res.json(err));
});
app.delete("/deleteCategoryReject", (req, res) => {
  CategoryModel.deleteMany({ status: 2 })
    .then((category) => {
      PostModel.updateMany({ "category.id": id }, { category: [] }).then(
        (post) => {
          res.json({ category, post });
        }
      );
    })
    .catch((err) => res.json(err));
});

//API post

app.get("/post", (req, res) => {
  PostModel.find({ hot: false, status: 1 })
    .sort({ createdAt: -1 })
    .then((post) => res.json(post))
    .catch((err) => res.json(err));
});

app.get("/getTotalAllPost", (req, res) => {
  PostModel.countDocuments({})
    .then((count) => res.json({ totalPost: count }))
    .catch((err) => res.json(err));
});

app.get("/getPostInMonth", (req, res) => {
  const startOfMonth = moment().startOf("month");
  const endOfMonth = moment().endOf("month");

  PostModel.countDocuments({
    createdAt: { $gte: startOfMonth.toDate(), $lte: endOfMonth.toDate() },
  })
    .then((count) => {
      res.json({ totalPost: count });
    })
    .catch((error) => {
      console.error("Error fetching number of posts:", error);
      res.status(500).json({ error: "Error Message: " + error });
    });
});

app.get("/getPostFilterManage/:status", (req, res) => {
  const status = req.params.status;
  // let query = {};
  // if (status) {
  //   query = { status: status };
  // }
  PostModel.find({ status: status })
    .sort({ createdAt: -1 })
    .then((category) => res.json(category))
    .catch((err) => res.json(err));
});

app.get("/postFilter", (req, res) => {
  const category = req.query.category;
  const sortByLike = req.query.sortByLike;
  const sortByView = req.query.sortByView;
  let sortOption = {};
  if (sortByLike === "likeIncrease") {
    sortOption.like = 1;
    // sortOption.view = 0;
    // sortOption.createdAt = 0;
  }
  if (sortByLike === "likeDecrease") {
    sortOption.like = -1;
    // sortOption.view = 0;
    // sortOption.createdAt = 0;
  }
  if (sortByView === "viewIncrease") {
    // sortOption.like = 0;
    sortOption.view = 1;
    // sortOption.createdAt = 0;
  }
  if (sortByView === "viewDecrease") {
    // sortOption.like = 0;
    sortOption.view = -1;
    // sortOption.createdAt = 0;
  }
  console.log("data", sortByView);

  let query = {};
  if (category) {
    query = { "category.slug": category };
  }
  PostModel.find(query)
    .sort(sortOption)
    .then((posts) => res.json(posts))
    .catch((error) => res.status(500).json({ message: error.message }));
});

app.get("/postHot", (req, res) => {
  const startOfMonth = moment().startOf("month");
  const endOfMonth = moment().endOf("month");

  PostModel.find({
    status: 1,
    createdAt: {
      $gte: startOfMonth.toDate(),
      $lte: endOfMonth.toDate(),
    },
  })
    .sort({ like: -1 })
    .limit(4)
    .then((post) => res.json(post))
    .catch((err) => res.json(err));
});

app.get("/allPost", (req, res) => {
  PostModel.find({ status: 1 })
    .sort({ createdAt: -1 })
    .then((post) => res.json(post))
    .catch((err) => res.json(err));
});

app.get("/getPostManage", (req, res) => {
  PostModel.find({})
    .sort({ createdAt: -1 })
    .then((post) => res.json(post))
    .catch((err) => res.json(err));
});

app.get("/postCategory/:slug", (req, res) => {
  const slug = req.params.slug;
  PostModel.find({ "category.slug": slug })
    .sort({ createdAt: -1 })
    .then((post) => res.json(post))
    .catch((err) => res.json(err));
});

app.get("/postAuthor/:slug", (req, res) => {
  const slug = req.params.slug;
  PostModel.find({ "user.slug": slug })
    .sort({ createdAt: -1 })
    .then((post) => res.json(post))
    .catch((err) => res.json(err));
});

app.get("/postAuthorId/:id", (req, res) => {
  const id = req.params.id;
  PostModel.find({ "user.id": id })
    .sort({ createdAt: -1 })
    .then((post) => res.json(post))
    .catch((err) => res.json(err));
});

app.get("/postDetail/:slug", (req, res) => {
  const slug = req.params.slug;
  PostModel.findOne({ slug: slug })
    .then((post) => res.json(post))
    .catch((err) => res.json(err));
});

const trainingData = [
  { text: "Vui ve", label: 1 },
  { text: "Thanh conh", label: 1 },
  { text: "Hanh Phuc", label: 1 },
  { text: "Tot", label: 1 },
  { text: "Vui tuoi", label: 1 },
  { text: "Thanh cong", label: 1 },
  { text: "Tot Bung", label: 1 },
  { text: "Tu Hao", label: 1 },
  { text: "cmm", label: 2 },
  { text: "dmm", label: 2 },
  { text: "dcmm", label: 2 },
  { text: "lmm", label: 2 },
  { text: "dmm", label: 2 },
  { text: "lol", label: 2 },
  { text: "mm", label: 2 },
  { text: "vcl", label: 2 },
];

trainingData.forEach((data) => {
  classifier.addDocument(data.text, data.label);
});

classifier.train();
app.post("/createPost", (req, res) => {
  const textToClassify = req.body.content;
  const wordWithoutDiacritics = unidecode(textToClassify);
  const classification = classifier.classify(wordWithoutDiacritics);
  // console.log(`Nhãn dự đoán: ${classification}`);

  PostModel.create({
    title: req.body.title,
    titleEN: req.body.titleEN,
    slug: req.body.slug,
    status: classification,
    hot: req.body.hot,
    image: req.body.image,
    content: req.body.content,
    contentEN: req.body.contentEN,
    user: req.body.user,
    category: req.body.category,
    view: req.body.view,
    like: 0,
    save: 0,
  })
    .then((post) => res.json(post))
    .catch((err) => res.json(err));
});

app.get("/getPost/:id", (req, res) => {
  const id = req.params.id;
  PostModel.findById({ _id: id })
    .then((post) => res.json(post))
    .catch((err) => res.json(err));
});

app.put("/updatePost/:id", (req, res) => {
  const id = req.params.id;
  PostModel.findByIdAndUpdate(
    { _id: id },
    {
      title: req.body.title,
      titleEN: req.body.titleEN,
      slug: req.body.slug,
      status: req.body.status,
      hot: req.body.hot,
      image: req.body.image,
      content: req.body.content,
      contentEN: req.body.contentEN,
      user: req.body.user,
      category: req.body.category,
      view: req.body.view,
      like: req.body.like,
      save: req.body.save,
    }
  )
    .then((post) => {
      res.json(post);
      socketIo.emit("notification", req.body.like || req.body.save);
    })
    .catch((err) => res.json(err));
});

app.put("/updatePostLike", async (req, res) => {
  const postId = req.query.id;
  const userId = req.query.userId;
  const action = req.query.action;

  try {
    const post = await PostModel.findById({ _id: postId });
    const user = await UserModel.findById({ _id: userId });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (!user) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (user.likePost === undefined) {
      user.likePost = [];
    }

    if (action === "increment") {
      post.like += 1;
      user.likePost.push(postId);
    } else if (action === "decrement") {
      post.like -= 1;
      const index = user.likePost.indexOf(postId);
      if (index !== -1) {
        user.likePost.splice(index, 1);
      }
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }
    const updatedPost = await post.save();
    const updatedUser = await user.save();
    res.json({ like: updatedPost.like, likePost: updatedUser.likePost });
  } catch (error) {
    console.error("Error updating like:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/deletePost/:id", (req, res) => {
  const id = req.params.id;
  PostModel.findByIdAndDelete({ _id: id })
    .then((post) => {
      CommentModel.deleteMany({ idPost: id }).then((comment) => {
        res.json({ post, comment });
      });
    })
    .catch((err) => res.json(err));
});
app.delete("/deletePostReject", (req, res) => {
  PostModel.deleteMany({ status: 3 })
    .then((post) => res.json(post))
    .catch((err) => res.json(err));
});

// Api comment

app.get("/comment/:id", (req, res) => {
  const idPost = req.params.id;
  CommentModel.find({ idPost: idPost, idReply: "" })
    .sort({ createdAt: -1 })
    .then((comment) => res.json(comment))
    .catch((err) => res.json(err));
});
app.get("/getReplyComment/:id", (req, res) => {
  const idPost = req.params.id;
  CommentModel.find({ idReply: idPost })
    .sort({ createdAt: -1 })
    .then((comment) => res.json(comment))
    .catch((err) => res.json(err));
});

app.post("/createComment", (req, res) => {
  // const comment = req.body.content;

  CommentModel.create({
    idReply: req.body.idReply,
    idPost: req.body.idPost,
    idUser: req.body.idUser,
    idUserReply: req.body.idUserReply,
    content: req.body.content,
    like: 0,
  })
    .then((comment) => {
      res.json(comment);
      socketIo.emit("notification", req.body.content);
    })
    .catch((err) => res.json(err));
});

app.put("/updateComment/:id", (req, res) => {
  const id = req.params.id;
  CommentModel.findByIdAndUpdate(
    { _id: id },
    {
      content: req.body.content,
      like: req.body.like,
    }
  )
    .then((comment) => {
      res.json(comment);
      socketIo.emit("notification-likeComment", req.body.like);
    })
    .catch((err) => res.json(err));
});

app.delete("/deleteComment/:id", (req, res) => {
  const id = req.params.id;
  CommentModel.findByIdAndDelete(id)
    .then((comment) => {
      CommentModel.deleteMany({ idReply: id })
        .then((replyComment) => {
          res.json({ comment, replyComment });
        })
        .catch((err) => res.status(500).json({ error: err.message }));
    })
    .catch((err) => res.status(500).json({ error: err.message }));
});

// Api contact

app.post("/createContact", (req, res) => {
  ContactModel.create({
    content: req.body.content,
    contentEN: req.body.contentEN,
  })
    .then((contact) => res.json(contact))
    .catch((err) => res.json(err));
});

app.get("/getContact/:id", (req, res) => {
  const id = req.params.id;
  ContactModel.findById({ _id: id })
    .then((contact) => res.json(contact))
    .catch((err) => res.json(err));
});

app.put("/updateContact/:id", (req, res) => {
  const id = req.params.id;
  ContactModel.findByIdAndUpdate(
    { _id: id },
    {
      content: req.body.content,
      contentEN: req.body.contentEN,
    }
  )
    .then((contact) => res.json(contact))
    .catch((err) => res.json(err));
});

// api Banner

app.post("/createBanner", (req, res) => {
  BannerSchema.create({
    title: req.body.title,
    titleEN: req.body.titleEN,
    image: req.body.image,
  })
    .then((banner) => res.json(banner))
    .catch((err) => res.json(err));
});

app.get("/getBanner/:id", (req, res) => {
  const id = req.params.id;
  BannerModel.findById({ _id: id })
    .then((banner) => res.json(banner))
    .catch((err) => res.json(err));
});

app.put("/updateBanner/:id", (req, res) => {
  const id = req.params.id;
  BannerModel.findByIdAndUpdate(
    { _id: id },
    {
      title: req.body.title,
      titleEN: req.body.titleEN,
      image: req.body.image,
    }
  )
    .then((banner) => res.json(banner))
    .catch((err) => res.json(err));
});

// Api Rule

app.post("/createRule", (req, res) => {
  RuleModel.create({
    content: req.body.content,
    contentEN: req.body.contentEN,
  })
    .then((rule) => res.json(rule))
    .catch((err) => res.json(err));
});

app.get("/getRule/:id", (req, res) => {
  const id = req.params.id;
  RuleModel.findById({ _id: id })
    .then((rule) => res.json(rule))
    .catch((err) => res.json(err));
});

app.put("/updateRule/:id", (req, res) => {
  const id = req.params.id;
  RuleModel.findByIdAndUpdate(
    { _id: id },
    {
      content: req.body.content,
      contentEN: req.body.contentEN,
    }
  )
    .then((rule) => res.json(rule))
    .catch((err) => res.json(err));
});

//Api report
app.post("/createReport", (req, res) => {
  ReportModel.create({
    idUser: req.body.idUser,
    idPost: req.body.idPost,
    idComment: req.body.idComment,
    reason: req.body.reason,
    reasonEN: req.body.reasonEN,
    description: req.body.description,
    descriptionEN: req.body.descriptionEN,
    active: 2,
  })
    .then((report) => res.json(report))
    .catch((err) => res.json(err));
});

app.put("/updateReport/:id", (req, res) => {
  const id = req.params.id;
  ReportModel.findByIdAndUpdate(
    { _id: id },
    {
      status: req.body.status,
    }
  )
    .then((report) => res.json(report))
    .catch((err) => res.json(err));
});

app.get("/getReportInMonth", (req, res) => {
  const startOfMonth = moment().startOf("month");
  const endOfMonth = moment().endOf("month");

  ReportModel.countDocuments({
    createdAt: { $gte: startOfMonth.toDate(), $lte: endOfMonth.toDate() },
  })
    .then((count) => {
      res.json({ totalReport: count });
    })
    .catch((error) => {
      console.error("Error fetching number of posts:", error);
      res.status(500).json({ error: "Error Message: " + error });
    });
});

app.get("/getTotalAllReport", (req, res) => {
  ReportModel.countDocuments({})
    .then((count) => res.json({ totalReport: count }))
    .catch((err) => res.json(err));
});

app.get("/getReport/:id", (req, res) => {
  const id = req.params.id;
  ReportModel.findById({ _id: id })
    .then((report) => res.json(report))
    .catch((err) => res.json(err));
});
app.get("/getAllReport", (req, res) => {
  ReportModel.find({})
    .sort({ createdAt: -1 })
    .then((report) => res.json(report))
    .catch((err) => res.json(err));
});

app.delete("/deleteReport/:id", (req, res) => {
  const id = req.params.id;
  ReportModel.findByIdAndDelete(id)
    .then((report) => res.json(report))
    .catch((err) => res.json(err));
});

app.get("/reportFilter/:status", (req, res) => {
  const status = req.params.status;
  let query = {};
  if (status) {
    query = { status: status };
  }
  ReportModel.find({ status: status })
    .sort({ createdAt: -1 })
    .then((user) => res.json(user))
    .catch((error) => res.status(500).json({ message: error.message }));
});

//Api Notification

app.get("/getNotificationById/:id", (req, res) => {
  const id = req.params.id;
  NotificationModel.find({ UserReceive: id })
    .sort({ createdAt: -1 })
    .then((notification) => res.json(notification))
    .catch((err) => res.json(err));
});

app.post("/createNotification", (req, res) => {
  NotificationModel.create({
    UserReceive: req.body.UserReceive,
    userId: req.body.userId,
    postId: req.body.postId,
    content: req.body.content,
    contentEN: req.body.contentEN,
    class: req.body.class,
    seen: false,
  })
    .then((notification) => res.json(notification))
    .catch((err) => res.json(err));
});

app.put("/updateNotification/:id", (req, res) => {
  const id = req.params.id;
  NotificationModel.findByIdAndUpdate(
    { _id: id },
    {
      seen: true,
    }
  )
    .then((notification) => res.json(notification))
    .catch((err) => res.json(err));
});

http.listen(3001, () => {
  console.log("app running");
});
