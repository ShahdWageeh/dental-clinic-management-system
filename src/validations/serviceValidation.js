import { body } from 'express-validator'

export const createServiceValidation = [
    body("name").notEmpty().withMessage("اسم الخدمة مطلوب"),
    body("price").isNumeric().withMessage("السعر يجب أن يكون رقمًا")
]