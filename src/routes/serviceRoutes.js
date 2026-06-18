import express from "express";
import {
  createService,
  getServices,
  getSingleService,
  updateService,
  deleteService,
  restoreService,
} from "../controllers/serviceController.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import { createServiceValidation } from "../validations/serviceValidation.js";
import validateMiddleware from "../middleware/validateMiddleware.js";

const router = express.Router();

/**
 * @openapi
 * /api/services:
 *   post:
 *     summary: إنشاء خدمة/علاج جديد
 *     description: تسجيل نوع خدمة أو إجراء علاجي جديد بالنظام (مثل حشو، خلع، تنظيف). متاح للمسؤول والطبيب فقط.
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       201:
 *         description: تم إنشاء الخدمة بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تم إنشاء الخدمة بنجاح
 *                 service:
 *                   $ref: '#/components/schemas/Service'
 *       400:
 *         description: الخدمة موجودة بالفعل أو مدخلات غير صحيحة
 *       500:
 *         description: حدث خطأ أثناء إنشاء الخدمة
 *   get:
 *     summary: جلب قائمة الخدمات المتاحة بالعيادة
 *     description: استرجاع جميع الخدمات مع دعم البحث والترقيم والفلترة بحسب الحالة النشطة (active).
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: رقم الصفحة
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: عدد العناصر بالصفحة
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: active
 *         in: query
 *         description: فلترة الخدمات النشطة فقط عند إرسال 'true'
 *         required: false
 *         schema:
 *           type: string
 *       - name: search
 *         in: query
 *         description: البحث في اسم الخدمة
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تم جلب الخدمات بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 services:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Service'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 2
 *                 totalServices:
 *                   type: integer
 *                   example: 15
 *       500:
 *         description: حدث خطأ أثناء جلب الخدمات
 */
router.post(
  "/",
  protect,
  authorizeRoles("admin", "doctor"),
  createServiceValidation,
  validateMiddleware,
  createService,
);

/**
 * @openapi
 * /api/services/{id}:
 *   get:
 *     summary: جلب بيانات خدمة معينة
 *     description: استرجاع بيانات خدمة علاجية معينة بواسطة معرفها الفريد.
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: معرف الخدمة
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تفاصيل الخدمة المسترجعة
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       404:
 *         description: الخدمة غير موجودة
 *       500:
 *         description: خطأ خادم داخلي
 *   put:
 *     summary: تحديث بيانات خدمة
 *     description: تعديل مواصفات أو سعر أو معلومات خدمة معينة. متاح للمسؤول والطبيب فقط.
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: معرف الخدمة
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       200:
 *         description: تم تعديل الخدمة بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تم تعديل الخدمة بنجاح
 *                 service:
 *                   $ref: '#/components/schemas/Service'
 *       404:
 *         description: الخدمة غير موجودة
 *       500:
 *         description: حدث خطأ أثناء تعديل الخدمة
 */
router.get('/', protect, getServices)
router.get('/:id', protect, getSingleService)
router.put('/:id', protect, authorizeRoles('admin', 'doctor'), updateService)

/**
 * @openapi
 * /api/services/{id}/delete:
 *   patch:
 *     summary: إلغاء تنشيط خدمة (حذف ناعم)
 *     description: جعل الخدمة غير نشطة (isActive = false) بدلاً من الحذف الفيزيائي لمنع مشاكل الفواتير السابقة. متاح للمسؤول والطبيب فقط.
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: معرف الخدمة
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تم الغاء الخدمة بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تم الغاء الخدمة بنجاح
 *       404:
 *         description: الخدمة غير موجودة
 *       500:
 *         description: حدث خطأ أثناء العملية
 */
router.patch('/:id/delete', protect, authorizeRoles('admin', 'doctor'), deleteService)

/**
 * @openapi
 * /api/services/{id}/restore:
 *   patch:
 *     summary: استعادة وتنشيط خدمة ملغاة
 *     description: إعادة تعيين حالة الخدمة إلى نشطة (isActive = true). متاح للمسؤول والطبيب فقط.
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: معرف الخدمة
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تم استعادة الخدمة بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تم استعادة الخدمة بنجاح
 *       404:
 *         description: الخدمة غير موجودة
 *       500:
 *         description: حدث خطأ أثناء العملية
 */
router.patch('/:id/restore', protect, authorizeRoles('admin', 'doctor'), restoreService)

export default router;
