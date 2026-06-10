import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["مواد علاج", "أدوات", "مستلزمات وقاية", "أدوية", "أخرى"],
      default: "أخرى",
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    minQuantity: {
      type: Number,
      required: true,
      default: 10,
    },
    unit: {
      type: String,
      required: true, // مثال: "قطعة", "علبة", "زجاجة"
    },
    supplier: {
      type: String,
      default: "",
    },
    costPerUnit: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Inventory = mongoose.model("Inventory", inventorySchema);
export default Inventory;