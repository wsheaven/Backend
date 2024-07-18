const Expense = require('../models/Expense');
const asyncHandler = require("express-async-handler");

const getAllExpensesByUserId = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    try {
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const expenses = await Expense.find({ user: userId }).exec(); // Removed .lean()

        const expensesWithVirtuals = expenses.map(expense => expense.toObject({ virtuals: true }));

        res.json(expensesWithVirtuals);
    } catch (error) {
        console.error('Failed to get expenses:', error);
        res.status(500).json({ message: 'Failed to get expenses', error: error.message });
    }
});

module.exports = { getAllExpensesByUserId };
