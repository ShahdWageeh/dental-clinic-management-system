import express from "express";
import {
  createItem,
  getItems,
  getSingleItem,
  updateItem,
  deleteItem,
  addStock,
  consumeStock,
  getLowStock,
} from "../controllers/inventoryController.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import {
  createItemValidation,
  updateItemValidation,
  stockValidation,
} from "../validations/inventoryValidation.js";
import validateMiddleware from "../middleware/validateMiddleware.js";
const router = express.Router();

/**
 * @openapi
 * /api/inventory/low-stock:
 *   get:
 *     summary: تقرير المواد منخفضة المخزون
 *     description: جلب قائمة بكافة المواد الطبية والمستلزمات النشطة التي وصلت كميتها الحالية للحد الأدنى للمخزون أو أقل منه. متاح للمسؤول فقط.
 *     tags:
 *       - Inventory
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم جلب التقرير بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Inventory'
 *                 total:
 *                   type: integer
 *                   example: 2
 *       500:
 *         description: خطأ في الخادم
 */
router.get("/low-stock", protect, authorizeRoles("admin"), getLowStock);

/**
 * @openapi
 * /api/inventory:
 *   post:
 *     summary: إضافة صنف جديد للمخزون
 *     description: تسجيل مادة أو أداة طبية جديدة في نظام المستودع بالعيادة. متاح للمسؤول فقط.
 *     tags:
 *       - Inventory
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Inventory'
 *     responses:
 *       201:
 *         description: تم إضافة المادة بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تم إضافة المادة بنجاح
 *                 item:
 *                   $ref: '#/components/schemas/Inventory'
 *       400:
 *         description: هذه المادة موجودة بالفعل أو مدخلات خاطئة
 *       500:
 *         description: خطأ في الخادم
 *   get:
 *     summary: جلب قائمة أصناف المخزون مع الترقيم والبحث
 *     description: استرجاع المواد النشطة بالمستودع مع دعم البحث بالاسم والفلترة بحسب الفئة والترقيم. متاح للمسؤول والطبيب.
 *     tags:
 *       - Inventory
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
 *       - name: category
 *         in: query
 *         description: فلترة بحسب فئة الصنف (مواد علاج، أدوات، مستلزمات وقاية، أدوية، أخرى)
 *         required: false
 *         schema:
 *           type: string
 *       - name: search
 *         in: query
 *         description: كلمة البحث في اسم الصنف
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تم جلب الأصناف بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Inventory'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 3
 *                 totalItems:
 *                   type: integer
 *                   example: 22
 *       500:
 *         description: خطأ في الخادم
 */
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createItemValidation,
  validateMiddleware,
  createItem
);

router.get("/", protect, authorizeRoles("admin", "doctor"), getItems);

/**
 * @openapi
 * /api/inventory/{id}:
 *   get:
 *     summary: جلب صنف مخزون معين
 *     description: استرجاع معلومات تفصيلية لصنف معين بالمستودع بواسطة معرفه الفريد. متاح للمسؤول والطبيب.
 *     tags:
 *       - Inventory
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: معرف صنف المخزون
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تفاصيل صنف المخزون
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inventory'
 *       404:
 *         description: المادة غير موجودة
 *       500:
 *         description: خطأ في الخادم
 *   put:
 *     summary: تحديث بيانات صنف مخزون
 *     description: تعديل مواصفات أو مورد أو الحد الأدنى لصنف مخزون قائم. متاح للمسؤول فقط.
 *     tags:
 *       - Inventory
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: معرف صنف المخزون
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Inventory'
 *     responses:
 *       200:
 *         description: تم تحديث المادة بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تم تحديث المادة بنجاح
 *                 item:
 *                   $ref: '#/components/schemas/Inventory'
 *       404:
 *         description: المادة غير موجودة
 *       500:
 *         description: خطأ في الخادم
 *   delete:
 *     summary: إقصاء/حذف صنف من المخزون (حذف ناعم)
 *     description: إلغاء تنشيط صنف بالمخزون (isActive = false) بدلاً من الحذف الفيزيائي. متاح للمسؤول فقط.
 *     tags:
 *       - Inventory
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: معرف صنف المخزون
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تم حذف المادة بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تم حذف المادة بنجاح
 *       404:
 *         description: المادة غير موجودة
 *       500:
 *         description: خطأ في الخادم
 */
router.get("/:id", protect, authorizeRoles("admin", "doctor"), getSingleItem);
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateItemValidation,
  validateMiddleware,
  updateItem
);

/**
 * @openapi
 * /api/inventory/{id}/add-stock:
 *   patch:
 *     summary: توريد/إضافة كمية جديدة للمخزون
 *     description: زيادة الكمية الحالية لصنف مخزون قائم عند استلام شحنة جديدة. متاح للمسؤول فقط.
 *     tags:
 *       - Inventory
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: معرف صنف المخزون
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: number
 *                 example: 20
 *     responses:
 *       200:
 *         description: تم إضافة الكمية بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تم إضافة الكمية بنجاح
 *                 item:
 *                   $ref: '#/components/schemas/Inventory'
 *       400:
 *         description: الكمية يجب أن تكون أكبر من صفر
 *       404:
 *         description: المادة غير موجودة
 *       500:
 *         description: خطأ في الخادم
 */
router.patch(
  "/:id/add-stock",
  protect,
  authorizeRoles("admin"),
  stockValidation,
  validateMiddleware,
  addStock
);
router.delete("/:id", protect, authorizeRoles("admin"), deleteItem);

/**
 * @openapi
 * /api/inventory/{id}/consume:
 *   patch:
 *     summary: تسجيل استهلاك كمية من المخزون
 *     description: خصم/سحب كمية معينة من صنف مخزون نتيجة للاستخدام بالعمليات الطبية بالعيادة. متاح للمسؤول والطبيب.
 *     tags:
 *       - Inventory
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: معرف صنف المخزون
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: number
 *                 example: 5
 *     responses:
 *       200:
 *         description: تم تسجيل الاستهلاك بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تم تسجيل الاستهلاك بنجاح
 *                 item:
 *                   $ref: '#/components/schemas/Inventory'
 *       400:
 *         description: الكمية المطلوبة غير متوفرة أو مدخل خاطئ
 *       404:
 *         description: المادة غير موجودة
 *       500:
 *         description: خطأ في الخادم
 */
router.patch(
  "/:id/consume",
  protect,
  authorizeRoles("admin", "doctor"),
  stockValidation,
  validateMiddleware,
  consumeStock
);

export default router;