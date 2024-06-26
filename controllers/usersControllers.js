const User = require("../models/User");
const Expense = require("../models/Expense");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }
  res.json(users);
});

// @desc Create a user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, email } = req.body


  // confirm the data
  if ( !username|| !password || !email) 
    {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicates
  const duplicateUserName = await User.findOne({ username }).lean().exec();
  if (duplicateUserName) {
    return res.status(409).json({ message: "Username is already in use" });
  }
  const duplicateEmail = await User.findOne({ email }).lean().exec();
  if (duplicateEmail) {
    return res.status(409).json({ message: "Email is already in use" });
  }

  // Hash the password
  const hashedPwd = await bcrypt.hash(password, 10); // 10 salt rounds

  const userObject = { username, password: hashedPwd, email };

  // create and store new user
  const user = await User.create(userObject);

  if (user) {
    //created
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
});

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const { id, username, password, email } = req.body;

  // confirm the data
  if (!username || !id || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Does the user exist to update?
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const duplicateUserName = await User.findOne({ username }).lean().exec();
  // Allow updates to the original user
  if (duplicateUserName && duplicateUserName?._id.toString() !== id) {
    return res.status(409).json({ message: "Username is already in use" });
  }

  const duplicateEmail = await User.findOne({ email }).lean().exec();
  // Allow updates to the original user
  if (duplicateEmail && duplicateEmail?._id.toString() !== id) {
    return res.status(409).json({ message: "Email is already in use" });
  }

  user.username = username;
  user.email = email;

  if (password) {
    // Hash password
    user.password = await bcrypt.hash(password, 10); // salt rounds
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated` });
});

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'User ID Required' })
    }

   // Does the user still have assigned notes?
    const expense = await Expense.findOne({ user: id }).lean().exec()
    if (expense) {
        return res.status(400).json({ message: 'User has assigned expenses' })
    }

    // Does the user exist to delete?
    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    const result = await user.deleteOne()

    const reply = `Username ${result.username} with ID ${result._id} deleted`

    res.json(reply)  

});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
