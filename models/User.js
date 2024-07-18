const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed passwords should be stored
  expenses: [{ type: mongoose.Types.ObjectId, ref: "Expense" }],
  refreshToken: String,
});

module.exports = mongoose.model("User", userSchema);
