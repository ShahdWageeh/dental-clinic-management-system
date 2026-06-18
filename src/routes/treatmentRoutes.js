import express from "express";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import { createTreatmentValidation } from "../validations/treatmentValidation.js";
import validateMiddleware from "../middleware/validateMiddleware.js";
import {
  createTreatment,
  getTreatments,
  getSingleTreatment,
  updateTreatment,
  cancelTreatment,
  completeTreatment,
} from "../controllers/treatmentController.js";

const router = express.Router()

/**
 * @openapi
 * /api/treatments:
 *   post:
 *     summary: إنشاء خطة علاج جديدة للموعد
 *     description: تسجيل خطة علاج لمريض وتحديد الخدمات الطبية المقدمة مع الكمية وتلقائياً حساب التكلفة الكلية. متاح للمسؤول والطبيب.
 *     tags:
 *       - Treatments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointment
 *               - services
 *             properties:
 *               appointment:
 *                 type: string
 *                 example: 60c72b2f9b1d8b2bad8e0f1c
 *               treatmentNotes:
 *                 type: string
 *                 example: يحتاج لإعادة كشف بعد اسبوع
 *               services:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - Service
 *                     - quantity
 *                   properties:
 *                     Service:
 *                       type: string
 *                       description: معرف الخدمة الطبي
 *                       example: 60c72b2f9b1d8b2bad8e0f1d
 *                     quantity:
 *                       type: integer
 *                       default: 1
 *                       example: 1
 *     responses:
 *       201:
 *         description: تم انشاء خطة العلاج بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تم انشاء خطة العلاج بنجاح
 *                 treatment:
 *                   $ref: '#/components/schemas/Treatment'
 *       400:
 *         description: يوجد خطة علاج بالفعل للموعد المحدد
 *       404:
 *         description: الحجز أو الخدمة غير موجودة
 *       500:
 *         description: حدث خطأ أثناء العملية
 *   get:
 *     summary: جلب خطط العلاج بالعيادة مع الترقيم
 *     description: استرجاع قائمة خطط العلاج في النظام مع دعم الفلترة بحسب الطبيب أو الحالة.
 *     tags:
 *       - Treatments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: doctor
 *         in: query
 *         description: معرف الطبيب للفلترة
 *         required: false
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         description: حالة خطة العلاج (معلق، مكتمل، ملغى)
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تم جلب خطط العلاج بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 treatments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Treatment'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 2
 *                 totalTreatments:
 *                   type: integer
 *                   example: 12
 *       500:
 *         description: حدث خطأ خادم داخلي
 */
router.post(
    "/",
    protect,
    authorizeRoles("admin", "doctor"),
    createTreatmentValidation,
    validateMiddleware,
    createTreatment,
)

/**
 * @openapi
 * /api/treatments/{id}:
 *   get:
 *     summary: جلب تفاصيل خطة علاج محددة
 *     description: استرجاع معلومات خطة علاج معينة بواسطة معرفها الفريد.
 *     tags:
 *       - Treatments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: معرف خطة العلاج
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تفاصيل خطة العلاج المسترجعة
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 treatment:
 *                   $ref: '#/components/schemas/Treatment'
 *       404:
 *         description: خطة العلاج غير موجودة
 *       500:
 *         description: خطأ خادم داخلي
 *   put:
 *     summary: تحديث بيانات خطة علاج
 *     description: تعديل الخدمات أو الملاحظات في خطة علاج طالما لم تكتمل أو تُلغى. متاح للمسؤول والطبيب.
 *     tags:
 *       - Treatments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: معرف خطة العلاج
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - services
 *             properties:
 *               treatmentNotes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [معلق, مكتمل, ملغى]
 *               services:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - Service
 *                     - quantity
 *                   properties:
 *                     Service:
 *                       type: string
 *                       example: 60c72b2f9b1d8b2bad8e0f1d
 *                     quantity:
 *                       type: integer
 *                       example: 1
 *     responses:
 *       200:
 *         description: تم تعديل خطة العلاج بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تم تعديل خطة العلاج بنجاح
 *                 treatment:
 *                   $ref: '#/components/schemas/Treatment'
 *       400:
 *         description: لا يمكن تعديل خطة علاج مكتملة أو ملغاة
 *       404:
 *         description: خطة العلاج أو أحد الخدمات غير موجودة
 *       500:
 *         description: حدث خطأ أثناء التعديل
 */
router.get('/', protect, getTreatments)
router.get('/:id', protect, getSingleTreatment)
router.put('/:id', protect, authorizeRoles('admin', 'doctor'), updateTreatment)

/**
 * @openapi
 * /api/treatments/{id}/cancel:
 *   patch:
 *     summary: إلغاء خطة العلاج
 *     description: تغيير حالة خطة العلاج والموعد المرتبط بها إلى "ملغى". متاح لجميع المستخدمين المسجلين.
 *     tags:
 *       - Treatments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: معرف خطة العلاج
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تم إلغاء خطة العلاج بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تم إلغاء خطة العلاج بنجاح
 *                 treatment:
 *                   $ref: '#/components/schemas/Treatment'
 *       400:
 *         description: لا يمكن إلغاء خطة علاج مكتملة أو ملغاة بالفعل
 *       404:
 *         description: خطة العلاج غير موجودة
 *       500:
 *         description: خطأ خادم داخلي
 */
router.patch('/:id/cancel', protect, cancelTreatment)

/**
 * @openapi
 * /api/treatments/{id}/complete:
 *   patch:
 *     summary: إكمال خطة العلاج بنجاح
 *     description: وضع علامة مكتمل لخطة العلاج والموعد المرتبط بها. متاح لجميع المستخدمين المسجلين.
 *     tags:
 *       - Treatments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: معرف خطة العلاج
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تم إكمال خطة العلاج بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تم إكمال خطة العلاج بنجاح
 *                 treatment:
 *                   $ref: '#/components/schemas/Treatment'
 *       400:
 *         description: خطة العلاج مكتملة بالفعل أو ملغاة
 *       404:
 *         description: خطة العلاج غير موجودة
 *       500:
 *         description: خطأ خادم داخلي
 */
router.patch('/:id/complete', protect, completeTreatment)

export default router;