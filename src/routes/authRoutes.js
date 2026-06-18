import express from 'express'
import { register, login, getMe, forgotPassword, resetPassword } from '../controllers/authController.js'
import protect from '../middleware/authMiddleware.js'
import { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation } from '../validations/authValidation.js'
import validateMiddleware from '../middleware/validateMiddleware.js'

const router = express.Router()

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: تسجيل حساب جديد
 *     description: إنشاء حساب مستخدم جديد بالنظام (مسؤول، طبيب، موظف استقبال).
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: محمد أحمد
 *               email:
 *                 type: string
 *                 format: email
 *                 example: doctor@clinic.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [admin, doctor, receptionist]
 *                 default: receptionist
 *                 example: doctor
 *               phone:
 *                 type: string
 *                 example: "0123456789"
 *               specialization:
 *                 type: string
 *                 example: جراحة أسنان
 *     responses:
 *       201:
 *         description: تم إنشاء الحساب بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تم إنشاء الحساب بنجاح
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 60c72b2f9b1d8b2bad8e0f1a
 *                     name:
 *                       type: string
 *                       example: محمد أحمد
 *                     email:
 *                       type: string
 *                       example: doctor@clinic.com
 *                     role:
 *                       type: string
 *                       example: doctor
 *       400:
 *         description: البريد الإلكتروني مستخدم بالفعل أو بيانات المدخلات غير صالحة
 *       500:
 *         description: حدث خطأ أثناء إنشاء الحساب
 */
router.post('/register', registerValidation, validateMiddleware, register)

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: تسجيل الدخول بنظام العيادة
 *     description: تسجيل الدخول للمستخدم عبر البريد الإلكتروني وكلمة المرور للحصول على رمز JWT.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: doctor@clinic.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: تم تسجيل الدخول بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تم تسجيل الدخول بنجاح
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 60c72b2f9b1d8b2bad8e0f1a
 *                     name:
 *                       type: string
 *                       example: محمد أحمد
 *                     email:
 *                       type: string
 *                       example: doctor@clinic.com
 *                     role:
 *                       type: string
 *                       example: doctor
 *       400:
 *         description: بيانات تسجيل الدخول غير صحيحة
 *       500:
 *         description: حدث خطأ أثناء تسجيل الدخول
 */
router.post('/login', loginValidation, validateMiddleware, login)

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: الحصول على بيانات المستخدم الحالي
 *     description: جلب معلومات الحساب الخاصة بالمستخدم الذي قام بتسجيل الدخول باستخدام الرمز الممرر في ترويسة الطلب.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: بيانات المستخدم الحالي
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: غير مصرح - الرمز غير موجود أو غير صالح
 */
router.get('/me', protect, getMe)

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     summary: طلب إعادة تعيين كلمة المرور
 *     description: إرسال رمز OTP مكون من 6 أرقام إلى البريد الإلكتروني الخاص بالمستخدم لإعادة تعيين كلمة المرور.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: doctor@clinic.com
 *     responses:
 *       200:
 *         description: تم إرسال الرمز بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني
 *       400:
 *         description: لا يوجد مستخدم بهذا البريد الإلكتروني
 *       500:
 *         description: حدث خطأ أثناء معالجة الطلب
 */
router.post('/forgot-password', forgotPasswordValidation, validateMiddleware, forgotPassword)

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     summary: إعادة تعيين كلمة المرور بواسطة رمز OTP
 *     description: استخدام رمز OTP المرسل مسبقاً مع البريد الإلكتروني لتعيين كلمة مرور جديدة للمستخدم.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: doctor@clinic.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: تم إعادة تعيين كلمة المرور بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: تم إعادة تعيين كلمة المرور بنجاح
 *       400:
 *         description: الرمز غير صالح أو انتهت صلاحيته
 *       500:
 *         description: حدث خطأ أثناء العملية
 */
router.post('/reset-password', resetPasswordValidation, validateMiddleware, resetPassword)

export default router