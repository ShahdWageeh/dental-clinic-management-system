import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedDuration: {
      type: Number,
      default: 30,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      enum: ["كشف", "تنظيف جير", "تلميع", "حشو", "علاج عصب", "خلع", "تركيبات"],
    },
    requiresNotes: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Service = mongoose.model("Service", serviceSchema)

export default Service;
