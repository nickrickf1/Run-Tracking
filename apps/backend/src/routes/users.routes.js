const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { updateProfile, changePassword } = require("../controllers/users.controller");

router.use(authMiddleware);

router.patch("/me", updateProfile);
router.patch("/me/password", changePassword);

module.exports = router;
