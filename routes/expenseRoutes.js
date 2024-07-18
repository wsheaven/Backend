const express = require("express");
const router = express.Router();
const expensesController = require("../controllers/expensesControllers");
const verifyJWT = require("../middleware/verifyJWT");

router
  .route("/")
  .get(verifyJWT, expensesController.getAllExpensesByUserId)
  .post(verifyJWT, expensesController.createNewExpense)
  .patch(verifyJWT, expensesController.updateExpense)
  .delete(verifyJWT, expensesController.deleteExpense);

module.exports = router;
