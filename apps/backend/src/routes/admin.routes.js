const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { adminMiddleware } = require("../middlewares/admin.middleware");
const { getUsers, getUserDetail, getDashboard } = require("../controllers/admin.controller");

router.use(authMiddleware, adminMiddleware);

router.get("/dashboard", getDashboard);
router.get("/users", getUsers);
router.get("/users/:id", getUserDetail);

module.exports = router;
