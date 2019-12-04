const express = require("express");
const router = express.Router();
const ctrl = require("../controllers");
const authRequired = require("../middleware/authRequired");

router.get("/", authRequired, ctrl.users.show); // runs authRequired function before the ctrl 

module.exports = router;
