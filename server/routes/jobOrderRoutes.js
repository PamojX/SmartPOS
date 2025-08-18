const express = require("express");
const router = express.Router();
const controller = require("../controllers/jobOrderController");

router.get("/", controller.getOrders);
router.post("/", controller.createOrder);
router.put("/:id", controller.updateOrderStatus);
router.delete("/:id", controller.deleteOrder);

module.exports = router;
