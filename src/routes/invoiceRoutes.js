import express from "express";
import {
  createInvoice,
  getInvoices,
  getSingleInvoice,
  addPayment,
  getPatientInvoices,
} from "../controllers/invoiceController.js";
import {
  createInvoiceValidation,
  addPaymentValidation,
} from "../validations/invoiceValidation.js";
import validateMiddleware from "../middleware/validateMiddleware.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @openapi
 * /api/invoices/patient/{patientId}:
 *   get:
 *     summary: جلب قائمة الفواتير لمريض معين
 *     description: استرجاع جميع الفواتير الصادرة باسم مريض محدد بواسطة معرّفه. متاح للمسؤول، موظف الاستقبال، والطبيب.
 *     tags:
 *       - Invoices
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: patientId
 *         in: path
 *         required: true
 *         description: معرف المريض
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تم جلب الفواتير بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 invoices:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Invoice'
 *                 total:
 *                   type: integer
 *                   example: 2
 *       500:
 *         description: خطأ في الخادم
 */
router.get(
  "/patient/:patientId",
  protect,
  authorizeRoles("admin", "receptionist", "doctor"),
  getPatientInvoices
);

/**
 * @openapi
 * /api/invoices:
 *   post:
 *     summary: إنشاء فاتورة جديدة لعلاج مكتمل
 *     description: إصدار فاتورة مالية بناءً على التكلفة الكلية لخطة علاج مكتملة مع إمكانية تطبيق نسبة أو قيمة خصم. متاح للمسؤول وموظف الاستقبال.
 *     tags:
 *       - Invoices
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - treatmentId
 *             properties:
 *               treatmentId:
 *                 type: string
 *                 example: 60c72b2f9b1d8b2bad8e0f1e
 *               discount:
 *                 type: number
 *                 default: 0
 *                 example: 50
 *     responses:
 *       201:
 *         description: تم إنشاء الفاتورة بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تم إنشاء الفاتورة بنجاح
 *                 invoice:
 *                   $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: العلاج غير مكتمل، أو تم إصدار فاتورة له مسبقاً، أو قيمة الخصم أكبر من الإجمالي
 *       404:
 *         description: العلاج غير موجود
 *       500:
 *         description: خطأ في الخادم
 *   get:
 *     summary: جلب قائمة الفواتير مع الفلترة والترقيم
 *     description: استرجاع جميع الفواتير الصادرة بالنظام مع إمكانية الفلترة بحسب حالة الدفع ومعرف المريض. متاح للمسؤول وموظف الاستقبال.
 *     tags:
 *       - Invoices
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
 *       - name: paymentStatus
 *         in: query
 *         description: فلترة بحسب حالة الدفع (pending, partial, paid)
 *         required: false
 *         schema:
 *           type: string
 *       - name: patient
 *         in: query
 *         description: فلترة بحسب معرف المريض
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تم جلب الفواتير بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 invoices:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Invoice'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 2
 *                 totalInvoices:
 *                   type: integer
 *                   example: 18
 *       500:
 *         description: خطأ في الخادم
 */
router.post(
  "/",
  protect,
  authorizeRoles("admin", "receptionist"),
  createInvoiceValidation,
  validateMiddleware,
  createInvoice
);

router.get(
  "/",
  protect,
  authorizeRoles("admin", "receptionist"),
  getInvoices
);

/**
 * @openapi
 * /api/invoices/{id}:
 *   get:
 *     summary: جلب تفاصيل فاتورة معينة
 *     description: استرجاع معلومات فاتورة تفصيلية بواسطة معرفها الفريد مع بيانات الخدمات المسجلة. متاح للمسؤول وموظف الاستقبال والطبيب.
 *     tags:
 *       - Invoices
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: معرف الفاتورة
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تفاصيل الفاتورة المسترجعة
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       404:
 *         description: الفاتورة غير موجودة
 *       500:
 *         description: خطأ في الخادم
 */
router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "receptionist", "doctor"),
  getSingleInvoice
);

/**
 * @openapi
 * /api/invoices/{id}/pay:
 *   patch:
 *     summary: تسجيل دفعة مالية جديدة للفاتورة
 *     description: إضافة عملية دفع مالي (كاملة أو جزئية) وتحديث المتبقي وحالة الفاتورة (pending, partial, paid). متاح للمسؤول وموظف الاستقبال.
 *     tags:
 *       - Invoices
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: معرف الفاتورة
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 100
 *               note:
 *                 type: string
 *                 example: دفعة نقدية ثانية
 *     responses:
 *       200:
 *         description: تم تسجيل الدفعة بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تم تسجيل الدفعة بنجاح
 *                 invoice:
 *                   $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: الفاتورة مدفوعة بالكامل بالفعل أو المبلغ يتجاوز الإجمالي المتبقي أو مدخلات خاطئة
 *       404:
 *         description: الفاتورة غير موجودة
 *       500:
 *         description: خطأ في الخادم
 */
router.patch(
  "/:id/pay",
  protect,
  authorizeRoles("admin", "receptionist"),
  addPaymentValidation,
  validateMiddleware,
  addPayment
);

export default router;