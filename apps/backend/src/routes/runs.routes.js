const router = require('express').Router()
const { authMiddleware } = require('../middlewares/auth.middleware')

const {
    createRun,
    listRuns,
    getRunById,
    updateRun,
    deleteRun
} = require('../controllers/runs.controller');

router.use(authMiddleware)

router.post("/", createRun)
router.get("/", listRuns)
router.get("/:id", getRunById)
router.patch("/:id", updateRun)
router.delete("/:id", deleteRun)

module.exports = router
