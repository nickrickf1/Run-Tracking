const router = require("express").Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const {
    stravaStatus,
    connectStrava,
    stravaCallback,
    importActivities,
    disconnectStrava,
} = require("./strava.controller");

router.get("/status", authMiddleware, stravaStatus);
router.get("/connect", connectStrava); // auth via query param (browser redirect)
router.get("/callback", stravaCallback);
router.post("/import", authMiddleware, importActivities);
router.delete("/disconnect", authMiddleware, disconnectStrava);

module.exports = router;
