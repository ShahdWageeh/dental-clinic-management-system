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

// ⚠️ patient/:patientId قبل /:id عشان ما يتعاملش معاه كـ id
router.get(
  "/patient/:patientId",
  protect,
  authorizeRoles("admin", "receptionist", "doctor"),
  getPatientInvoices
);

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

router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "receptionist", "doctor"),
  getSingleInvoice
);

router.patch(
  "/:id/pay",
  protect,
  authorizeRoles("admin", "receptionist"),
  addPaymentValidation,
  validateMiddleware,
  addPayment
);

export default router;