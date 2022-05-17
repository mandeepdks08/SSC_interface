const express = require("express");
const router = express.Router();
const { authenticate, checkConnected } = require("../middleware");

const controller = require("../controllers/cart");

router.get(
  "/connect",
  authenticate,
  checkConnected,
  controller.renderConnectCartPage
);

router.post("/connect", authenticate, checkConnected, controller.connectCart);

router.get("/interface", authenticate, controller.renderCartInterface);

router.post("/pair", authenticate, controller.pairCart);

router.get("/checkout", authenticate, controller.renderCheckoutPage);

router.post("/checkout", authenticate, controller.checkout);

router.get("/checkout/success", controller.renderPaymentSuccessfulPage);

module.exports = router;
