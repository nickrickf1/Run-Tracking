const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { getGoal, setGoal } = require("../controllers/goals.controller");

router.use(authMiddleware);

router.get("/weekly", getGoal);
router.put("/weekly", setGoal);

module.exports = router;
