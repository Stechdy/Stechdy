const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discountController');
const { protect, admin } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// ======= Admin routes =======
router.post('/', admin, discountController.createDiscount);
router.get('/', admin, discountController.getAllDiscounts);
router.get('/:id', admin, discountController.getDiscountById);
router.put('/:id', admin, discountController.updateDiscount);
router.delete('/:id', admin, discountController.deleteDiscount);
router.patch('/:id/toggle', admin, discountController.toggleDiscountStatus);

// ======= User routes =======
router.post('/validate', discountController.validateDiscount);
router.post('/apply', discountController.applyDiscount);

module.exports = router;
