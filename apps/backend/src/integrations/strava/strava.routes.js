const router = require("express").Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const {
    connectStrava,
    stravaCallback,
} = require("./strava.controller");

router.get("/connect", authMiddleware, connectStrava);
router.get("/callback", stravaCallback);

module.exports = router;
