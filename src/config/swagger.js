import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Dental Clinic Management System API",
      version: "1.0.0",
      description: "Restful API for managing a dental clinic.",
    },
    servers: [
      {
        url: "https://dental-clinic-management-system-silk.vercel.app",
        description:"Production"
      },
      {
        url:"https://localhost:5000",
        description:"Local Development"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            _id: { type: "string", example: "60c72b2f9b1d8b2bad8e0f1a" },
            name: { type: "string", example: "محمد أحمد" },
            email: { type: "string", format: "email", example: "doctor@clinic.com" },
            password: { type: "string", example: "password123" },
            role: { type: "string", enum: ["admin", "doctor", "receptionist"], default: "receptionist", example: "doctor" },
            phone: { type: "string", example: "0123456789" },
            specialization: { type: "string", example: "جراحة أسنان" },
            profileImage: { type: "string", example: "http://res.cloudinary.com/...jpg" },
            isActive: { type: "boolean", default: true, example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        Patient: {
          type: "object",
          required: ["fullName", "gender", "age", "phone"],
          properties: {
            _id: { type: "string", example: "60c72b2f9b1d8b2bad8e0f1b" },
            fullName: { type: "string", example: "أحمد علي" },
            gender: { type: "string", enum: ["ذكر", "أنثى"], example: "ذكر" },
            dateOfBirth: { type: "string", format: "date", example: "1990-01-01" },
            age: { type: "number", example: 36 },
            phone: { type: "string", example: "0100200300" },
            emergencyContact: { type: "string", example: "0110200300" },
            address: { type: "string", example: "القاهرة، مصر" },
            allergies: { type: "array", items: { type: "string" }, example: ["البنسلين"] },
            medicalHistory: { type: "string", example: "ضغط دم مرتفع" },
            notes: { type: "string", example: "يحتاج لمتابعة خاصة" },
            xraysImages: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  public_id: { type: "string", example: "xray_123" },
                  url: { type: "string", example: "http://res.cloudinary.com/...jpg" }
                }
              }
            },
            createdBy: { type: "string", example: "60c72b2f9b1d8b2bad8e0f1a" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        Appointment: {
          type: "object",
          required: ["patient", "doctor", "appointmentDate", "appointmentTime", "reason"],
          properties: {
            _id: { type: "string", example: "60c72b2f9b1d8b2bad8e0f1c" },
            patient: { type: "string", example: "60c72b2f9b1d8b2bad8e0f1b" },
            doctor: { type: "string", example: "60c72b2f9b1d8b2bad8e0f1a" },
            appointmentDate: { type: "string", format: "date", example: "2026-06-20" },
            appointmentTime: { type: "string", example: "14:30" },
            status: { type: "string", enum: ["عين موعد", "مؤكد", "جاري العمل", "مكتمل", "ملغي"], default: "عين موعد", example: "مؤكد" },
            reason: { type: "string", example: "ألم في الضرس الخلفي" },
            notes: { type: "string", example: "حالة طارئة" },
            createdBy: { type: "string", example: "60c72b2f9b1d8b2bad8e0f1a" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        Service: {
          type: "object",
          required: ["name", "price"],
          properties: {
            _id: { type: "string", example: "60c72b2f9b1d8b2bad8e0f1d" },
            name: { type: "string", example: "تنظيف جير وتلميع" },
            description: { type: "string", example: "إزالة الجير من الأسنان وتلميعها" },
            price: { type: "number", example: 200 },
            estimatedDuration: { type: "number", default: 30, example: 45 },
            isActive: { type: "boolean", default: true, example: true },
            category: { type: "string", enum: ["كشف", "تنظيف جير", "تلميع", "حشو", "علاج عصب", "خلع", "تركيبات"], example: "تنظيف جير" },
            requiresNotes: { type: "boolean", default: false, example: false },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        Treatment: {
          type: "object",
          required: ["appointment", "patient", "doctor"],
          properties: {
            _id: { type: "string", example: "60c72b2f9b1d8b2bad8e0f1e" },
            appointment: { type: "string", example: "60c72b2f9b1d8b2bad8e0f1c" },
            patient: { type: "string", example: "60c72b2f9b1d8b2bad8e0f1b" },
            doctor: { type: "string", example: "60c72b2f9b1d8b2bad8e0f1a" },
            services: {
              type: "array",
              items: {
                type: "object",
                required: ["service", "price"],
                properties: {
                  service: { type: "string", example: "60c72b2f9b1d8b2bad8e0f1d" },
                  quantity: { type: "number", default: 1, example: 1 },
                  price: { type: "number", example: 200 }
                }
              }
            },
            totalCost: { type: "number", default: 0, example: 200 },
            treatmentNotes: { type: "string", example: "تم الانتهاء من التنظيف" },
            status: { type: "string", enum: ["معلق", "مكتمل", "ملغى"], default: "معلق", example: "مكتمل" },
            invoiceGenerated: { type: "boolean", default: false, example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        Invoice: {
          type: "object",
          required: ["treatment", "patient", "issuedBy", "subtotal", "totalAmount", "remainingAmount"],
          properties: {
            _id: { type: "string", example: "60c72b2f9b1d8b2bad8e0f1f" },
            treatment: { type: "string", example: "60c72b2f9b1d8b2bad8e0f1e" },
            patient: { type: "string", example: "60c72b2f9b1d8b2bad8e0f1b" },
            issuedBy: { type: "string", example: "60c72b2f9b1d8b2bad8e0f1a" },
            services: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  service: { type: "string", example: "60c72b2f9b1d8b2bad8e0f1d" },
                  quantity: { type: "number", example: 1 },
                  price: { type: "number", example: 200 }
                }
              }
            },
            subtotal: { type: "number", example: 200 },
            discount: { type: "number", default: 0, example: 20 },
            totalAmount: { type: "number", example: 180 },
            paidAmount: { type: "number", default: 0, example: 100 },
            remainingAmount: { type: "number", example: 80 },
            paymentStatus: { type: "string", enum: ["pending", "partial", "paid"], default: "pending", example: "partial" },
            payments: {
              type: "array",
              items: {
                type: "object",
                required: ["amount"],
                properties: {
                  _id: { type: "string", example: "60c72b2f9b1d8b2bad8e0f20" },
                  amount: { type: "number", example: 100 },
                  note: { type: "string", example: "دفعة أولى" },
                  receivedBy: { type: "string", example: "60c72b2f9b1d8b2bad8e0f1a" },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" }
                }
              }
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        Inventory: {
          type: "object",
          required: ["itemName", "quantity", "minQuantity", "unit"],
          properties: {
            _id: { type: "string", example: "60c72b2f9b1d8b2bad8e0f21" },
            itemName: { type: "string", example: "مخدر موضعي بوليبرين" },
            category: { type: "string", enum: ["مواد علاج", "أدوات", "مستلزمات وقاية", "أدوية", "أخرى"], default: "أخرى", example: "أدوية" },
            quantity: { type: "number", default: 0, example: 50 },
            minQuantity: { type: "number", default: 10, example: 15 },
            unit: { type: "string", example: "علبة" },
            supplier: { type: "string", example: "شركة النور للمستلزمات" },
            costPerUnit: { type: "number", default: 0, example: 120 },
            isActive: { type: "boolean", default: true, example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        Notification: {
          type: "object",
          required: ["recipient", "title", "message"],
          properties: {
            _id: { type: "string", example: "60c72b2f9b1d8b2bad8e0f22" },
            recipient: { type: "string", example: "60c72b2f9b1d8b2bad8e0f1a" },
            title: { type: "string", example: "مخزون منخفض" },
            message: { type: "string", example: "لقد وصل صنف مخدر موضعي بوليبرين إلى الحد الأدنى للمخزون" },
            isRead: { type: "boolean", default: false, example: false },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
