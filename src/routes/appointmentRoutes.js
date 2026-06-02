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

router.post(
  "/",
  protect,
  authorizeRoles("admin", "receptionist"),
  createAppointmentValidation,
  validateMiddleware,
  createAppointment,
);

router.get("/", protect, getAppointments);
router.get("/:id", protect, getSingleAppointment);
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "receptionist"),
  updateAppointment,
);
router.patch(
  "/:id/cancel",
  protect,
  authorizeRoles("admin", "receptionist"),
  cancelAppointment,
);
router.patch(
  "/:id/complete",
  protect,
  authorizeRoles("admin", "receptionist"),
  completeAppointment,
);

export default router;
