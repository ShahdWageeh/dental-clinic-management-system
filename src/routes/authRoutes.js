import express from 'express'
import { register, login, getMe, forgotPassword, resetPassword } from '../controllers/authController.js'
import protect from '../middleware/authMiddleware.js'
import { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation } from '../validations/authValidation.js'
import validateMiddleware from '../middleware/validateMiddleware.js'

const router = express.Router()
router.post('/register', registerValidation, validateMiddleware, register)
router.post('/login', loginValidation, validateMiddleware, login)
router.get('/me', protect, getMe)
router.post('/forgot-password', forgotPasswordValidation, validateMiddleware, forgotPassword)
router.post('/reset-password', resetPasswordValidation, validateMiddleware, resetPassword)

export default router