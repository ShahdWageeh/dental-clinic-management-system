import { body } from "express-validator";

export const createItemValidation = [
  body("itemName")
    .notEmpty()
    .withMessage("اسم المادة مطلوب")
    .isString()
    .withMessage("اسم المادة يجب أن يكون نصاً"),

  body("category")
    .optional()
    .isIn(["مواد علاج", "أدوات", "مستلزمات وقاية", "أدوية", "أخرى"])
    .withMessage("الفئة غير صحيحة"),

  body("quantity")
    .notEmpty()
    .withMessage("الكمية مطلوبة")
    .isNumeric()
    .withMessage("الكمية يجب أن تكون رقماً")
    .custom((value) => value >= 0)
    .withMessage("الكمية لا يمكن أن تكون سالبة"),

  body("minQuantity")
    .notEmpty()
    .withMessage("الحد الأدنى مطلوب")
    .isNumeric()
    .withMessage("الحد الأدنى يجب أن يكون رقماً")
    .custom((value) => value >= 0)
    .withMessage("الحد الأدنى لا يمكن أن يكون سالباً"),

  body("unit")
    .notEmpty()
    .withMessage("وحدة القياس مطلوبة")
    .isString()
    .withMessage("وحدة القياس يجب أن تكون نصاً"),

  body("supplier")
    .optional()
    .isString()
    .withMessage("اسم المورد يجب أن يكون نصاً"),

  body("costPerUnit")
    .optional()
    .isNumeric()
    .withMessage("التكلفة يجب أن تكون رقماً")
    .custom((value) => value >= 0)
    .withMessage("التكلفة لا يمكن أن تكون سالبة"),
];

export const updateItemValidation = [
  body("itemName")
    .optional()
    .isString()
    .withMessage("اسم المادة يجب أن يكون نصاً"),

  body("category")
    .optional()
    .isIn(["مواد علاج", "أدوات", "مستلزمات وقاية", "أدوية", "أخرى"])
    .withMessage("الفئة غير صحيحة"),

  body("quantity")
    .optional()
    .isNumeric()
    .withMessage("الكمية يجب أن تكون رقماً")
    .custom((value) => value >= 0)
    .withMessage("الكمية لا يمكن أن تكون سالبة"),

  body("minQuantity")
    .optional()
    .isNumeric()
    .withMessage("الحد الأدنى يجب أن يكون رقماً")
    .custom((value) => value >= 0)
    .withMessage("الحد الأدنى لا يمكن أن يكون سالباً"),

  body("unit")
    .optional()
    .isString()
    .withMessage("وحدة القياس يجب أن تكون نصاً"),

  body("supplier")
    .optional()
    .isString()
    .withMessage("اسم المورد يجب أن يكون نصاً"),

  body("costPerUnit")
    .optional()
    .isNumeric()
    .withMessage("التكلفة يجب أن تكون رقماً")
    .custom((value) => value >= 0)
    .withMessage("التكلفة لا يمكن أن تكون سالبة"),
];

export const stockValidation = [
  body("quantity")
    .notEmpty()
    .withMessage("الكمية مطلوبة")
    .isNumeric()
    .withMessage("الكمية يجب أن تكون رقماً")
    .custom((value) => value > 0)
    .withMessage("الكمية يجب أن تكون أكبر من صفر"),
];