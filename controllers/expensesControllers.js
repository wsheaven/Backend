const User = require("../models/User");
const Expense = require("../models/Expense");
const asyncHandler = require("express-async-handler");

const getAllExpensesByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  try {
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId).exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const expenses = await Expense.find({ user: userId }).lean().exec();

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const createNewExpense = asyncHandler(async (req, res) => {
  const {
    userId,
    category,
    cost,
    notes,
    mileage,
    isGasExpense,
    milesTraveledForGas,
    gasGallons,
  } = req.body;

  if (!userId || !category || !cost || !mileage) {
    return res
      .status(400)
      .json({ message: "All required fields must be provided" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const expenseData = {
    user: userId,
    category,
    cost,
    notes,
    mileage,
    date: new Date(),
    isGasExpense: isGasExpense || false,
    milesTraveledForGas,
    gasGallons,
  };

  const expense = await Expense.create(expenseData);

  if (expense) {
    // Update user's expenses array
    user.expenses.push(expense._id);
    await user.save();

    // Created
    res
      .status(201)
      .json({
        message: "New expense created and added to user",
        expenseId: expense._id,
      });
  } else {
    res.status(400).json({ message: "Invalid expense data received" });
  }
});

const updateExpense = asyncHandler(async (req, res) => {
  const {
    expenseId,
    category,
    cost,
    notes,
    mileage,
    isGasExpense,
    milesTraveledForGas,
  } = req.body;

  try {
    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (category !== undefined) expense.category = category;
    if (cost !== undefined) expense.cost = cost;
    if (notes !== undefined) expense.notes = notes;
    if (mileage !== undefined) expense.mileage = mileage;
    if (isGasExpense !== undefined) expense.isGasExpense = isGasExpense;
    if (milesTraveledForGas !== undefined)
      expense.milesTraveledForGas = milesTraveledForGas;

    await expense.save();

    res.json({
      message: "Expense updated successfully",
      expense: expense,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const deleteExpense = asyncHandler(async (req, res) => {
  const { expenseId } = req.body;

  try {
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const userId = expense.user;

    await Expense.findByIdAndDelete(expenseId);

    await User.findByIdAndUpdate(userId, { $pull: { expenses: expenseId } });

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = {
  getAllExpensesByUserId,
  createNewExpense,
  updateExpense,
  deleteExpense,
  getAllExpensesByUserId,
};
