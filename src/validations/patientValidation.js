import { body } from "express-validator";

export const createPatientValidation = [
    body("fullName").notEmpty().withMessage("اسم المريض مطلوب"),
    body("gender").notEmpty().withMessage("النوع مطلوب").isIn(["ذكر", "أنثى"]).withMessage("النوع يجب أن يكون ذكر أو أنثى"),
    body("age").notEmpty().withMessage("العمر مطلوب").isInt({ min: 0 }).withMessage("العمر يجب أن يكون رقمًا صحيحًا"),
    body("phone").notEmpty().withMessage("رقم الهاتف مطلوب").isMobilePhone("ar-EG").withMessage("رقم الهاتف غير صالح"),
]