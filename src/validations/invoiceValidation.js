import { body } from "express-validator";

export const createInvoiceValidation = [
  body("treatmentId")
    .notEmpty()
    .withMessage("العلاج مطلوب")
    .isMongoId()
    .withMessage("معرف العلاج غير صحيح"),

  body("discount")
    .optional()
    .isNumeric()
    .withMessage("الخصم يجب أن يكون رقماً")
    .custom((value) => value >= 0)
    .withMessage("الخصم لا يمكن أن يكون سالباً"),
];

export const addPaymentValidation = [
  body("amount")
    .notEmpty()
    .withMessage("المبلغ مطلوب")
    .isNumeric()
    .withMessage("المبلغ يجب أن يكون رقماً")
    .custom((value) => value > 0)
    .withMessage("المبلغ يجب أن يكون أكبر من صفر"),

  body("note")
    .optional()
    .isString()
    .withMessage("الملاحظة يجب أن تكون نصاً"),
];