const router = require('express').Router()
const multer = require('multer')
const { authMiddleware } = require('../middlewares/auth.middleware')

const {
    createRun,
    listRuns,
    getRunById,
    updateRun,
    deleteRun,
    exportCsv,
} = require('../controllers/runs.controller');
const { importGpx } = require('../controllers/import.controller');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(authMiddleware)

router.post("/", createRun)
router.post("/import/gpx", upload.single("file"), importGpx)
router.get("/", listRuns)
router.get("/export/csv", exportCsv)
router.get("/:id", getRunById)
router.patch("/:id", updateRun)
router.delete("/:id", deleteRun)

module.exports = router
