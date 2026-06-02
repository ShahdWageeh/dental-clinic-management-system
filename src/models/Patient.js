import moongoose from "mongoose";

const patientSchema = new moongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "اسم المريض مطلوب"],
      trim: true,
    },
    gender: {
      type: String,
      enum: ["ذكر", "أنثى"],
      required: [true, "النوع مطلوب"],
    },
    dateOfBirth: {
      type: Date,
    },
    age: {
      type: Number,
      required: [true, "العمر مطلوب"],
    },
    phone: {
      type: String,
      required: [true, "رقم الهاتف مطلوب"],
    },
    emergencyContact: {
      type: String,
    },
    address: {
      type: String,
    },
    allergies: {
      type: [String],
      default: [],
    },
    medicalHistory: {
      type: String,
    },
    notes: {
      type: String,
    },
    xraysImages: [
      {
        public_id: String,
        url: String,
      },
    ],
    createdBy: {
      type: moongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

const Patient = moongoose.model("Patient", patientSchema);

export default Patient;
