const express = require('express')
const router = express.Router()
const expensesController = require('../controllers/expensesControllers')

router.route('/')
    .get(expensesController.getAllExpensesByUserId)
    .post(expensesController.createNewExpense)
    .patch(expensesController.updateExpense)
    .delete(expensesController.deleteExpense)

module.exports = router