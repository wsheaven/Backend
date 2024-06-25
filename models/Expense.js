const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true },
  cost: { type: Number, required: true },
  notes: String,
  mileage: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  isGasExpense: { type: Boolean, default: false },
  milesTraveledForGas: Number,
});

expenseSchema.virtual("milesPerGallon").get(function () {
  if (this.isGasExpense && this.milesTraveledForGas && this.cost) {
    return this.milesTraveledForGas / this.cost; // Assuming 'cost' here means the amount of gas purchased
  }
  return null;
});

const Expense = mongoose.model("Expense", expenseSchema);
