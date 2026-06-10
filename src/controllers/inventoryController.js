import Inventory from "../models/Inventory.js";
import User from "../models/User.js";
import { notifyAdmins } from "../utils/sendNotification.js";

// ─── Create Item ──────────────────────────────────────────
// POST /api/inventory
// Access: Admin
export const createItem = async (req, res) => {
  try {
    const { itemName, category, quantity, minQuantity, unit, supplier, costPerUnit } =
      req.body;

    const existing = await Inventory.findOne({ itemName, isActive: true });
    if (existing) {
      return res.status(400).json({ message: "هذه المادة موجودة بالفعل" });
    }

    const item = await Inventory.create({
      itemName,
      category,
      quantity,
      minQuantity,
      unit,
      supplier,
      costPerUnit,
    });

    if (item.quantity <= item.minQuantity) {
      await notifyAdmins(
        "تنبيه: مخزون منخفض",
        `كمية "${item.itemName}" وصلت إلى ${item.quantity} ${item.unit} — الحد الأدنى: ${item.minQuantity}`
      );
    }

    res.status(201).json({ message: "تم إضافة المادة بنجاح", item });
  } catch (error) {
    res.status(500).json({ message: "خطأ في الخادم", error: error.message });
  }
};

// ─── Get All Items ────────────────────────────────────────
// GET /api/inventory
// Access: Admin, Doctor
export const getItems = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      filter.itemName = { $regex: req.query.search, $options: "i" };
    }

    const items = await Inventory.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Inventory.countDocuments(filter);

    res.status(200).json({
      items,
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (error) {
    res.status(500).json({ message: "خطأ في الخادم", error: error.message });
  }
};

// ─── Get Single Item ──────────────────────────────────────
// GET /api/inventory/:id
// Access: Admin, Doctor
export const getSingleItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item || !item.isActive) {
      return res.status(404).json({ message: "المادة غير موجودة" });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: "خطأ في الخادم", error: error.message });
  }
};

// ─── Update Item ──────────────────────────────────────────
// PUT /api/inventory/:id
// Access: Admin
export const updateItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item || !item.isActive) {
      return res.status(404).json({ message: "المادة غير موجودة" });
    }

    const updated = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (updated.quantity <= updated.minQuantity) {
      await notifyAdmins(
        "تنبيه: مخزون منخفض",
        `كمية "${updated.itemName}" وصلت إلى ${updated.quantity} ${updated.unit} — الحد الأدنى: ${updated.minQuantity}`
      );
    }

    res.status(200).json({ message: "تم تحديث المادة بنجاح", item: updated });
  } catch (error) {
    res.status(500).json({ message: "خطأ في الخادم", error: error.message });
  }
};

// ─── Soft Delete ──────────────────────────────────────────
// DELETE /api/inventory/:id
// Access: Admin
export const deleteItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item || !item.isActive) {
      return res.status(404).json({ message: "المادة غير موجودة" });
    }
    item.isActive = false;
    await item.save();
    res.status(200).json({ message: "تم حذف المادة بنجاح" });
  } catch (error) {
    res.status(500).json({ message: "خطأ في الخادم", error: error.message });
  }
};

// ─── Add Stock ────────────────────────────────────────────
// PATCH /api/inventory/:id/add-stock
// Access: Admin
export const addStock = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "الكمية يجب أن تكون أكبر من صفر" });
    }

    const item = await Inventory.findById(req.params.id);
    if (!item || !item.isActive) {
      return res.status(404).json({ message: "المادة غير موجودة" });
    }

    item.quantity += quantity;
    await item.save();

    res.status(200).json({ message: "تم إضافة الكمية بنجاح", item });
  } catch (error) {
    res.status(500).json({ message: "خطأ في الخادم", error: error.message });
  }
};

// ─── Consume Stock ────────────────────────────────────────
// PATCH /api/inventory/:id/consume
// Access: Admin, Doctor
export const consumeStock = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "الكمية يجب أن تكون أكبر من صفر" });
    }

    const item = await Inventory.findById(req.params.id);
    if (!item || !item.isActive) {
      return res.status(404).json({ message: "المادة غير موجودة" });
    }

    if (item.quantity < quantity) {
      return res.status(400).json({
        message: `الكمية المطلوبة غير متوفرة. المتاح: ${item.quantity} ${item.unit}`,
      });
    }

    item.quantity -= quantity;
    await item.save();

    if (item.quantity <= item.minQuantity) {
      await notifyAdmins(
        "تنبيه: مخزون منخفض",
        `كمية "${item.itemName}" وصلت إلى ${item.quantity} ${item.unit} — الحد الأدنى: ${item.minQuantity}`
      );
    }

    res.status(200).json({ message: "تم تسجيل الاستهلاك بنجاح", item });
  } catch (error) {
    res.status(500).json({ message: "خطأ في الخادم", error: error.message });
  }
};

// ─── Low Stock Report ─────────────────────────────────────
// GET /api/inventory/low-stock
// Access: Admin
export const getLowStock = async (req, res) => {
  try {
    const items = await Inventory.find({
      isActive: true,
      $expr: { $lte: ["$quantity", "$minQuantity"] },
    });

    res.status(200).json({ items, total: items.length });
  } catch (error) {
    res.status(500).json({ message: "خطأ في الخادم", error: error.message });
  }
};