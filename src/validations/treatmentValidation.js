import { body } from 'express-validator'

export const createTreatmentValidation = [
    body('appointment').notEmpty().withMessage("معاد الحجز مطلوب"),
    body('services').isArray({min: 1}).withMessage("اضيف خدمة واحدة علي الاقل")
]