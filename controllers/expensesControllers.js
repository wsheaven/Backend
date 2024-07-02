const User = require("../models/User");
const Expense = require("../models/Expense");
const asyncHandler = require("express-async-handler");

// @desc Get all users
// @route GET /users
// @access Private
const getAllExpensesByUserId = asyncHandler(async (req, res) => {
    const { userId } = req.body; // or req.body if passed in the body

    try {
        // Validate if the userId is provided
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Check if the user exists using the userId
        const user = await User.findById(userId).exec();

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find all expenses for the found user using the ObjectId
        const expenses = await Expense.find({ user: userId }).lean().exec();

        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


const createNewExpense = asyncHandler(async (req, res) => {
    const { userId, category, cost, notes, mileage, isGasExpense, milesTraveledForGas } = req.body;

    // Confirm the data
    if (!userId || !category || !cost || !mileage) {
        return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Create the expense object
    const expenseData = {
        user: userId,
        category,
        cost,
        notes,
        mileage,
        date: new Date(), // Optional: handle date if not provided in the request
        isGasExpense: isGasExpense || false,
        milesTraveledForGas
    };

    // Create and store the new expense
    const expense = await Expense.create(expenseData);

    if (expense) {
        // Update user's expenses array
        user.expenses.push(expense._id);
        await user.save(); // Save the updated user document

        // Created
        res.status(201).json({ message: "New expense created and added to user", expenseId: expense._id });
    } else {
        res.status(400).json({ message: "Invalid expense data received" });
    }
});

const updateExpense = asyncHandler(async (req, res) => {
    const { expenseId, category, cost, notes, mileage, isGasExpense, milesTraveledForGas } = req.body;

    try {
        // Find the expense by ID and update it
        const expense = await Expense.findById(expenseId);

        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        // Update fields if provided
        if (category !== undefined) expense.category = category;
        if (cost !== undefined) expense.cost = cost;
        if (notes !== undefined) expense.notes = notes;
        if (mileage !== undefined) expense.mileage = mileage;
        if (isGasExpense !== undefined) expense.isGasExpense = isGasExpense;
        if (milesTraveledForGas !== undefined) expense.milesTraveledForGas = milesTraveledForGas;

        // Save the updated document
        await expense.save();

        res.json({
            message: "Expense updated successfully",
            expense: expense
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

const deleteExpense = asyncHandler(async (req, res) => {
    const { expenseId } = req.body; // Get expense ID from URL parameters

    try {
        // Find the expense and its associated user
        const expense = await Expense.findById(expenseId);
        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        const userId = expense.user;

        // Delete the expense
        await Expense.findByIdAndDelete(expenseId);

        // Update the user document to remove the expense from the expenses array
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
    getAllExpensesByUserId
};