import express from "express";
import {
  createAppointment,
  getAppointments,
  getSingleAppointment,
  updateAppointment,
  cancelAppointment,
  completeAppointment,
} from "../controllers/appointmentController.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import { createAppointmentValidation } from "../validations/appointmentValidation.js";
import validateMiddleware from "../middleware/validateMiddleware.js";

const router = express.Router();

/**
 * @openapi
 * /api/appointments:
 *   post:
 *     summary: إنشاء حجز موعد جديد
 *     description: تسجيل موعد حجز جديد لمريض مع طبيب محدد. متاح للمسؤول وموظف الاستقبال.
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       201:
 *         description: تم إنشاء الموعد بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تم إنشاء الموعد بنجاح
 *                 appointment:
 *                   $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: الموعد محجوز بالفعل أو المستخدم ليس طبيباً
 *       404:
 *         description: المريض أو الطبيب غير موجود
 *       500:
 *         description: خطأ في الخادم
 *   get:
 *     summary: جلب قائمة المواعيد مع الفلترة والترقيم
 *     description: استرجاع جميع الحجوزات مع إمكانية الفلترة بحسب المعرّف الخاص بالطبيب، حالة الموعد، أو تاريخ الحجز.
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: رقم الصفحة (يُمرر في الكود كـ pqge)
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: عدد المواعيد لكل صفحة
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
 *         description: حالة الحجز للفلترة (عين موعد، مؤكد، جاري العمل، مكتمل، ملغي)
 *         required: false
 *         schema:
 *           type: string
 *       - name: date
 *         in: query
 *         description: التاريخ للفلترة (YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تم جلب المواعيد بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 appointments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 3
 *                 totalAppointments:
 *                   type: integer
 *                   example: 25
 *       500:
 *         description: خطأ في الخادم
 */
router.post(
  "/",
  protect,
  authorizeRoles("admin", "receptionist"),
  createAppointmentValidation,
  validateMiddleware,
  createAppointment,
);

/**
 * @openapi
 * /api/appointments/{id}:
 *   get:
 *     summary: جلب تفاصيل موعد معين
 *     description: استرجاع معلومات حجز معين بواسطة معرفه الفريد مع بيانات المريض والطبيب كاملة.
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: معرف الحجز
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تفاصيل الحجز
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       404:
 *         description: الحجز غير موجود
 *       500:
 *         description: خطأ في الخادم
 *   put:
 *     summary: تحديث بيانات حجز موعد
 *     description: تعديل بيانات موعد حجز قائم (مثل التاريخ أو الوقت أو الطبيب). متاح للمسؤول وموظف الاستقبال.
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: معرف الحجز
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       200:
 *         description: تم تحديث الحجز بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تم تحديث الحجز بنجاح
 *                 appointment:
 *                   $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: الموعد الجديد محجوز بالفعل
 *       404:
 *         description: الحجز غير موجود
 *       500:
 *         description: خطأ في الخادم
 */
router.get("/", protect, getAppointments);
router.get("/:id", protect, getSingleAppointment);
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "receptionist"),
  updateAppointment,
);

/**
 * @openapi
 * /api/appointments/{id}/cancel:
 *   patch:
 *     summary: إلغاء حجز موعد
 *     description: تغيير حالة الحجز إلى "ملغي". متاح للمسؤول وموظف الاستقبال.
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: معرف الحجز
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تم إلغاء الحجز بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تم إلغاء الحجز بنجاح
 *       404:
 *         description: الحجز غير موجود
 *       500:
 *         description: خطأ في الخادم
 */
router.patch(
  "/:id/cancel",
  protect,
  authorizeRoles("admin", "receptionist"),
  cancelAppointment,
);

/**
 * @openapi
 * /api/appointments/{id}/complete:
 *   patch:
 *     summary: إكمال حجز موعد
 *     description: تغيير حالة الحجز إلى "مكتمل". متاح للمسؤول وموظف الاستقبال.
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: معرف الحجز
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تم انهاء الحجز بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تم انهاء الحجز بنجاح
 *       404:
 *         description: الحجز غير موجود
 *       500:
 *         description: خطأ في الخادم
 */
router.patch(
  "/:id/complete",
  protect,
  authorizeRoles("admin", "receptionist"),
  completeAppointment,
);

export default router;
