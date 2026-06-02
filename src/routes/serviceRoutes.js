import express from "express";
import {
  createService,
  getServices,
  getSingleService,
  updateService,
  deleteService,
  restoreService,
} from "../controllers/serviceController.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import { createServiceValidation } from "../validations/serviceValidation.js";
import validateMiddleware from "../middleware/validateMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("admin", "doctor"),
  createServiceValidation,
  validateMiddleware,
  createService,
);

router.get('/', protect, getServices)
router.get('/:id', protect, getSingleService)
router.put('/:id', protect, authorizeRoles('admin', 'doctor'), updateService)
router.patch('/:id/delete', protect, authorizeRoles('admin', 'doctor'), deleteService)
router.patch('/:id/restore', protect, authorizeRoles('admin', 'doctor'), restoreService)

export default router;
