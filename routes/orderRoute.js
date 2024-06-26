const express = require('express');
const {
  createCashOrder,
  getSpecificOrder,
  filterOrdersForLoggedUser,
  getAllOrders,
  updateOrderToPaid,
  updateOrderToDelivered,
  checkoutSession,
  deleteOrderById,
   updateOrderToSeen,
} = require('../controllers/orderService');

const authController = require('../controllers/authController');

const router = express.Router();
router.use(authController.auth);

router.post('/checkout-session/:cartId', checkoutSession);

router
  .route('/:cartId')
  .post(authController.allowedTo('user'), createCashOrder);

router
  .route('/')
  .get(
    authController.allowedTo('user', 'admin', 'manager'),
    filterOrdersForLoggedUser,
    getAllOrders
  );

router
  .route('/:id')
  .get(authController.allowedTo('user', 'admin', 'manager'), getSpecificOrder)
  .delete(authController.allowedTo('admin'), deleteOrderById);
router.put('/seen', updateOrderToSeen);
router.put('/:id/pay', updateOrderToPaid);
router.put('/:id/deliver', updateOrderToDelivered);

module.exports = router;
