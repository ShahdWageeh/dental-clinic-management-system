import { body } from 'express-validator'

export const registerValidation = [
  body("name")
    .notEmpty()
    .withMessage("الاسم مطلوب"),

  body("email")
    .isEmail()
    .withMessage("البريد الإلكتروني غير صالح"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("كلمة المرور يجب أن تكون 6 أحرف على الأقل"),

  body("role")
    .optional()
    .isIn(["admin", "doctor", "receptionist"])
    .withMessage("نوع المستخدم غير صالح"),
];


export const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("البريد الإلكتروني غير صالح"),

  body("password")
    .notEmpty()
    .withMessage("كلمة المرور مطلوبة"),
];

export const forgotPasswordValidation = [
    body("email").isEmail().withMessage("البريد الإلكتروني غير صحيح"),
]

export const resetPasswordValidation = [
    body("newPassword").isLength({ min: 6 }).withMessage("كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
]