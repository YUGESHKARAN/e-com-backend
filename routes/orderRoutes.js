const express = require("express");
const router = express.Router();
const {addOrders, getAllOrders, getOrdersByEmail, updateOrder, deleteOrder} = require('../controller/orderController')

router.get('/get',getAllOrders);
router.get('/get/:email',getOrdersByEmail);
router.post('/add',addOrders);
router.put('/edit/:orderId',updateOrder);
router.delete('/delete/:orderId',deleteOrder);

module.exports = router