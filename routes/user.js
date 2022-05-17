const express = require("express");
const router = express.Router();
const controller = require("../controllers/user");
const { authenticate } = require("../middleware");

router.get("/login", controller.renderLoginForm);

router.post("/login", controller.login);

router.get("/register", controller.renderRegisterForm);

router.post("/register", controller.register);

router.get("/logout", authenticate, controller.logout);

module.exports = router;
