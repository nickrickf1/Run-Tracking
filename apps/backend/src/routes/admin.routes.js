const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { adminMiddleware } = require("../middlewares/admin.middleware");
const { getUsers, getUserDetail } = require("../controllers/admin.controller");

// Tutte le route richiedono auth + admin
router.use(authMiddleware, adminMiddleware);

router.get("/users", getUsers);
router.get("/users/:id", getUserDetail);

module.exports = router;
