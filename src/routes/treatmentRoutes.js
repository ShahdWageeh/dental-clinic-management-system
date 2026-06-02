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

router.post(
    "/",
    protect,
    authorizeRoles("admin", "doctor"),
    createTreatmentValidation,
    validateMiddleware,
    createTreatment,
)
router.get('/', protect, getTreatments)
router.get('/:id', protect, getSingleTreatment)
router.put('/:id', protect, authorizeRoles('admin', 'doctor'), updateTreatment)
router.patch('/:id/cancel', protect, cancelTreatment)
router.patch('/:id/complete', protect, completeTreatment)

export default router;