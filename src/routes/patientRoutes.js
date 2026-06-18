import express from "express";
import {
  createPatient,
  getPatients,
  getSinglePatient,
  updatePatient,
  deletePatient,
  uploadXrays,
} from "../controllers/patientController.js";
import { createPatientValidation } from "../validations/patientValidation.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import validateMiddleware from "../middleware/validateMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/**
 * @openapi
 * /api/patients:
 *   post:
 *     summary: إضافة مريض جديد
 *     description: تسجيل بيانات مريض جديد بالنظام. متاح للمسؤول وموظف الاستقبال.
 *     tags:
 *       - Patients
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Patient'
 *     responses:
 *       201:
 *         description: تم إضافة المريض بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تم اضافة المريض بنجاح
 *                 patient:
 *                   $ref: '#/components/schemas/Patient'
 *       400:
 *         description: بيانات المدخلات غير صالحة
 *       401:
 *         description: غير مصرح
 *       403:
 *         description: غير مسموح لهذه الصلاحية
 *       500:
 *         description: حدث خطأ أثناء العملية
 *   get:
 *     summary: جلب قائمة المرضى مع الترقيم والبحث
 *     description: استرجاع قائمة بجميع المرضى في النظام، تدعم البحث عن طريق الاسم والترقيم (pagination).
 *     tags:
 *       - Patients
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
 *         description: عدد العناصر في الصفحة
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: search
 *         in: query
 *         description: كلمة البحث (البحث في اسم المريض الكامل)
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: قائمة المرضى المسترجعة بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patients:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Patient'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 totalPatients:
 *                   type: integer
 *                   example: 45
 *       401:
 *         description: غير مصرح
 *       500:
 *         description: حدث خطأ أثناء جلب البيانات
 */
router.post(
  "/",
  protect,
  authorizeRoles("admin", "receptionist"),
  createPatientValidation,
  validateMiddleware,
  createPatient,
);

/**
 * @openapi
 * /api/patients/{id}/xrays:
 *   post:
 *     summary: رفع صور الأشعة للمريض
 *     description: رفع ما يصل إلى 5 صور أشعة للمريض باستخدام multipart/form-data وحفظها على Cloudinary.
 *     tags:
 *       - Patients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: المعرف الفريد للمريض
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - xrays
 *             properties:
 *               xrays:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: ملفات صور الأشعة للرفع (بحد أقصى 5 ملفات)
 *     responses:
 *       200:
 *         description: تم رفع الأشعة بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تم رفع الاشعة بنجاح
 *                 images:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       public_id:
 *                         type: string
 *                       url:
 *                         type: string
 *       404:
 *         description: المريض غير موجود
 *       500:
 *         description: حدث خطأ أثناء العملية
 */
router.post(
  '/:id/xrays',
  protect,
  upload.array('xrays', 5),
  uploadXrays, 
)

/**
 * @openapi
 * /api/patients/{id}:
 *   get:
 *     summary: جلب بيانات مريض محدد
 *     description: جلب التفاصيل الكاملة لمريض معين بواسطة معرّفه الفريد.
 *     tags:
 *       - Patients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: المعرف الفريد للمريض
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: بيانات المريض المسترجعة
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       444:
 *         description: المريض غير موجود
 *       404:
 *         description: المريض غير موجود
 *       500:
 *         description: حدث خطأ في الخادم
 *   put:
 *     summary: تحديث بيانات مريض
 *     description: تحديث جزئي أو كامل لبيانات مريض معين. متاح للمسؤول وموظف الاستقبال.
 *     tags:
 *       - Patients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: المعرف الفريد للمريض
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Patient'
 *     responses:
 *       200:
 *         description: تم تحديث بيانات المريض بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تم تحديث بيانات المريض بنجاح
 *                 patient:
 *                   $ref: '#/components/schemas/Patient'
 *       404:
 *         description: المريض غير موجود
 *       500:
 *         description: حدث خطأ أثناء التحديث
 *   delete:
 *     summary: حذف مريض من النظام
 *     description: حذف سجل المريض نهائياً من قاعدة البيانات. متاح للمسؤول (admin) فقط.
 *     tags:
 *       - Patients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: المعرف الفريد للمريض
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تم حذف المريض بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تم حذف المريض بنجاح
 *       404:
 *         description: المريض غير موجود
 *       403:
 *         description: غير مسموح - للمسؤول فقط
 *       500:
 *         description: حدث خطأ أثناء الحذف
 */
router.get("/", protect, getPatients);
router.get("/:id", protect, getSinglePatient);
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "receptionist"),
  updatePatient,
);
router.delete("/:id", protect, authorizeRoles("admin"), deletePatient);

export default router;