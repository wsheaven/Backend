const Expense = require('../models/Expense'); // Assuming this is your Expense model
const asyncHandler = require("express-async-handler");

const getAllExpensesByUserId = asyncHandler(async (req, res) => {
    const { userId } = req.params; // Extract the userId from the request parameters

    try {
        // Ensure the userId is provided
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Find all expenses for this user
        const expenses = await Expense.find({ user: userId }).lean().exec();

        // Send the found expenses back to the client
        res.json(expenses);
    } catch (error) {
        console.error('Failed to get expenses:', error);
        res.status(500).json({ message: 'Failed to get expenses', error: error.message });
    }
});

module.exports = {getAllExpensesByUserId }