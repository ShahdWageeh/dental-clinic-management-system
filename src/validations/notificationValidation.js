import { param } from "express-validator";

export const notificationIdValidation = [
  param("id")
    .notEmpty()
    .withMessage("معرف الإشعار مطلوب")
    .isMongoId()
    .withMessage("معرف الإشعار غير صالح"),
];
