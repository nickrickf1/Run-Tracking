const router = require('express').Router()
const {register, login, me} = require('../controllers/auth.controller')
const {authMiddleware} = require('../middlewares/auth.middleware')

router.post("/register", register)
router.post("/login", login)
router.get("/me", authMiddleware, me)

module.exports = router
