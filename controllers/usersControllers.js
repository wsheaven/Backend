const User = require("../models/User");
const Expense = require("../models/Expense");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }
  res.json(users);
});

const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const duplicateUserName = await User.findOne({ username }).lean().exec();
  if (duplicateUserName) {
    return res.status(409).json({ message: "Username is already in use" });
  }
  const duplicateEmail = await User.findOne({ email }).lean().exec();
  if (duplicateEmail) {
    return res.status(409).json({ message: "Email is already in use" });
  }

  const hashedPwd = await bcrypt.hash(password, 10); // 10 salt rounds

  const userObject = { username, password: hashedPwd, email };

  const user = await User.create(userObject);

  if (user) {
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const { id, username, password, email } = req.body;

  if (!username || !id || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const duplicateUserName = await User.findOne({ username }).lean().exec();
  if (duplicateUserName && duplicateUserName?._id.toString() !== id) {
    return res.status(409).json({ message: "Username is already in use" });
  }

  const duplicateEmail = await User.findOne({ email }).lean().exec();
  if (duplicateEmail && duplicateEmail?._id.toString() !== id) {
    return res.status(409).json({ message: "Email is already in use" });
  }

  user.username = username;
  user.email = email;

  if (password) {
    user.password = await bcrypt.hash(password, 10); // salt rounds
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated` });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "User ID Required" });
  }

  const expense = await Expense.findOne({ user: id }).lean().exec();
  if (expense) {
    return res.status(400).json({ message: "User has assigned expenses" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const result = await user.deleteOne();

  const reply = `Username ${result.username} with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
