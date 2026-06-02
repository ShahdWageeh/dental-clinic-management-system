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

router.post(
  "/",
  protect,
  authorizeRoles("admin", "receptionist"),
  createPatientValidation,
  validateMiddleware,
  createPatient,
);
router.post(
  '/:id/xrays',
  protect,
  upload.array('xrays', 5),
  uploadXrays, 
)
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