const router = require('express').Router();

const {authMiddleware} = require('../middlewares/auth.middleware');
const {getSummary, getWeekly} = require('../controllers/stats.controller');

router.use(authMiddleware);

router.get('/summary', getSummary);
router.get('/weekly', getWeekly);

module.exports = router;