const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    cost: { type: Number, required: true },
    notes: String,
    mileage: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    isGasExpense: { type: Boolean, default: false },
    milesTraveledForGas: Number,
    gasGallons: Number,
  },
  {
    toJSON: { virtuals: true }, // Ensure virtuals are included in toJSON()
    toObject: { virtuals: true }, // Ensure virtuals are included in toObject()
  }
);

expenseSchema.virtual("milesPerGallon").get(function () {
  if (this.isGasExpense && this.milesTraveledForGas && this.gasGallons) {
    return this.milesTraveledForGas / this.gasGallons;
  }
  return null;
});

module.exports = mongoose.model("Expense", expenseSchema);
