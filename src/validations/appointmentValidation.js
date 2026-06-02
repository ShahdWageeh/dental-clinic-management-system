import { body } from 'express-validator';

export const createAppointmentValidation = [
    body('patient').notEmpty().withMessage('المريض مطلوب'),
    body('doctor').notEmpty().withMessage('الطبيب مطلوب'),
    body('appointmentDate').notEmpty().withMessage('تاريخ الحجز مطلوب'),
    body('appointmentTime').notEmpty().withMessage('وقت الحجز مطلوب'),
    body('reason').notEmpty().withMessage('سبب الحجز مطلوب'),
]