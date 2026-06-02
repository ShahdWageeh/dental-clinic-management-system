import mongoose from "mongoose";

const treatmentSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    services: [
      {
        service: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Services",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalCost: {
      type: Number,
      default: 0,
    },
    treatmentNotes: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["معلق", "مكتمل", "ملغى"],
      default: "معلق",
    },
    invoiceGenerated: {
        type: Boolean,
        default: false,
    }
  },
  { timestamps: true },
);

const Treatment = mongoose.model("Treatment", treatmentSchema)

export default Treatment;