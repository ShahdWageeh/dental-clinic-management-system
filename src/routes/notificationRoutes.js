import express from "express";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import { notificationIdValidation } from "../validations/notificationValidation.js";
import validateMiddleware from "../middleware/validateMiddleware.js";
const router = express.Router();

/**
 * @openapi
 * /api/notifications/read-all:
 *   patch:
 *     summary: تعليم جميع الإشعارات كمقروءة
 *     description: تعديل حالة كافة الإشعارات غير المقروءة الخاصة بالمستخدم الحالي لتصبح مقروءة. متاح للمسؤول فقط.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم تحديد جميع الإشعارات كمقروءة
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تم تحديد جميع الإشعارات كمقروءة
 *       500:
 *         description: خطأ في الخادم
 */
router.patch("/read-all", protect, authorizeRoles("admin"), markAllAsRead);

/**
 * @openapi
 * /api/notifications:
 *   get:
 *     summary: جلب إشعارات المستخدم الحالي مع الترقيم
 *     description: استرجاع قائمة بجميع الإشعارات الموجهة للمستخدم المسجل الحالي، مع دعم فلترة المقروء/غير المقروء والترقيم. متاح للمسؤول فقط.
 *     tags:
 *       - Notifications
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
 *           default: 20
 *       - name: isRead
 *         in: query
 *         description: فلترة بحسب حالة القراءة ('true' للمقروءة، 'false' لغير المقروءة)
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تم جلب الإشعارات بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 2
 *                 totalNotifications:
 *                   type: integer
 *                   example: 15
 *                 unreadCount:
 *                   type: integer
 *                   example: 3
 *       500:
 *         description: خطأ في الخادم
 */
router.get("/", protect, authorizeRoles("admin"), getMyNotifications);

/**
 * @openapi
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: تعليم إشعار محدد كمقروء
 *     description: تعديل حالة إشعار معين موجه للمستخدم الحالي ليصبح مقروءاً. متاح للمسؤول فقط.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: معرف الإشعار
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تم تحديد الإشعار كمقروء
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تم تحديد الإشعار كمقروء
 *       444:
 *         description: الإشعار غير موجود
 *       404:
 *         description: الإشعار غير موجود
 *       500:
 *         description: خطأ في الخادم
 */
router.patch(
  "/:id/read",
  protect,
  authorizeRoles("admin"),
  notificationIdValidation,
  validateMiddleware,
  markAsRead
);

/**
 * @openapi
 * /api/notifications/{id}:
 *   delete:
 *     summary: حذف إشعار معين
 *     description: إزالة سجل إشعار موجه للمستخدم الحالي نهائياً من قاعدة البيانات. متاح للمسؤول فقط.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: معرف الإشعار
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تم حذف الإشعار بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تم حذف الإشعار
 *       404:
 *         description: الإشعار غير موجود
 *       500:
 *         description: خطأ في الخادم
 */
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  notificationIdValidation,
  validateMiddleware,
  deleteNotification
);
export default router;