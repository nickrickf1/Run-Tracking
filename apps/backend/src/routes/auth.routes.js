const router = require('express').Router()
const {register, login, me, refresh} = require('../controllers/auth.controller')
const {authMiddleware} = require('../middlewares/auth.middleware')

router.post("/register", register)
router.post("/login", login)
router.get("/me", authMiddleware, me)
router.post("/refresh", authMiddleware, refresh)

module.exports = router
