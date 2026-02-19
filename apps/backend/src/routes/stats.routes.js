const router = require('express').Router();

const {authMiddleware} = require('../middlewares/auth.middleware');
const {getSummary, getWeekly, getPersonalBests, getStreak, getCalendar} = require('../controllers/stats.controller');

router.use(authMiddleware);

router.get('/summary', getSummary);
router.get('/weekly', getWeekly);
router.get('/personal-bests', getPersonalBests);
router.get('/streak', getStreak);
router.get('/calendar', getCalendar);

module.exports = router;