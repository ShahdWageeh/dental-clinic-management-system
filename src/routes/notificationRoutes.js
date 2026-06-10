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

router.patch("/read-all", protect, authorizeRoles("admin"), markAllAsRead);
router.get("/", protect, authorizeRoles("admin"), getMyNotifications);


router.patch(
  "/:id/read",
  protect,
  authorizeRoles("admin"),
  notificationIdValidation,
  validateMiddleware,
  markAsRead
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  notificationIdValidation,
  validateMiddleware,
  deleteNotification
);
export default router;