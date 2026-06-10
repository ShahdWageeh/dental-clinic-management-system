import Invoice from "../models/Invoice.js";
import Treatment from "../models/Treatment.js";
import { calcPaymentStatus, calcTotalAmount } from "../utils/calculateInvoice.js";

// ─── Create Invoice ───────────────────────────────────────
// POST /api/invoices
// Access: Admin, Receptionist
export const createInvoice = async (req, res) => {
  try {
    const { treatmentId, discount = 0 } = req.body;

    const treatment = await Treatment.findById(treatmentId).populate(
      "services.service"
    );
    if (!treatment) {
      return res.status(404).json({ message: "العلاج غير موجود" });
    }

    // Treatment must be completed before generating invoice
    if (treatment.status !== "مكتمل") {
      return res
        .status(400)
        .json({ message: "لا يمكن إنشاء فاتورة لعلاج غير مكتمل" });
    }

    // Prevent duplicate invoice
    if (treatment.invoiceGenerated) {
      return res
        .status(400)
        .json({ message: "تم إنشاء فاتورة لهذا العلاج مسبقاً" });
    }

    const subtotal = treatment.totalCost;
   const totalAmount = calcTotalAmount(subtotal, discount);
if (totalAmount === null) {
  return res.status(400).json({ message: "الخصم لا يمكن أن يكون أكبر من الإجمالي" });
}

    const invoice = await Invoice.create({
      treatment: treatment._id,
      patient: treatment.patient,
      issuedBy: req.user._id,
      services: treatment.services,
      subtotal,
      discount,
      totalAmount,
      paidAmount: 0,
      remainingAmount: totalAmount,
      paymentStatus: "pending",
    });

    // Mark treatment as invoiced
    treatment.invoiceGenerated = true;
    await treatment.save();

    // Notify admins
    await Notification.create({
      recipient: req.user._id,
      title: "تم إنشاء فاتورة جديدة",
      message: `تم إنشاء فاتورة بمبلغ ${totalAmount} جنيه`,
      type: "invoice",
    });

    res.status(201).json({ message: "تم إنشاء الفاتورة بنجاح", invoice });
  } catch (error) {
    res.status(500).json({ message: "خطأ في الخادم", error: error.message });
  }
};

// ─── Get All Invoices ─────────────────────────────────────
// GET /api/invoices
// Access: Admin, Receptionist
export const getInvoices = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
    if (req.query.patient) filter.patient = req.query.patient;

    const invoices = await Invoice.find(filter)
      .populate("patient", "fullName phone")
      .populate("issuedBy", "name role")
      .populate("treatment", "status totalCost")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Invoice.countDocuments(filter);

    res.status(200).json({
      invoices,
      page,
      totalPages: Math.ceil(total / limit),
      totalInvoices: total,
    });
  } catch (error) {
    res.status(500).json({ message: "خطأ في الخادم", error: error.message });
  }
};

// ─── Get Single Invoice ───────────────────────────────────
// GET /api/invoices/:id
// Access: Admin, Receptionist, Doctor (own patients)
export const getSingleInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("patient", "fullName phone")
      .populate("issuedBy", "name role")
      .populate("treatment")
      .populate("services.service", "name price");

    if (!invoice) {
      return res.status(404).json({ message: "الفاتورة غير موجودة" });
    }

    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: "خطأ في الخادم", error: error.message });
  }
};

// ─── Add Payment ──────────────────────────────────────────
// PATCH /api/invoices/:id/pay
// Access: Admin, Receptionist
export const addPayment = async (req, res) => {
  try {
    const { amount, note } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "المبلغ يجب أن يكون أكبر من صفر" });
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "الفاتورة غير موجودة" });
    }

    if (invoice.paymentStatus === "paid") {
      return res.status(400).json({ message: "تم دفع هذه الفاتورة بالكامل مسبقاً" });
    }

    const newPaid = invoice.paidAmount + amount;

    if (newPaid > invoice.totalAmount) {
      return res.status(400).json({
        message: `المبلغ المدفوع يتجاوز الإجمالي. المتبقي: ${invoice.remainingAmount}`,
      });
    }

    // Add to payment history
    invoice.payments.push({
      amount,
      note: note || "",
      receivedBy: req.user._id,
    });

    invoice.paidAmount = newPaid;
    invoice.remainingAmount = invoice.totalAmount - newPaid;
    invoice.paymentStatus = calcPaymentStatus(newPaid, invoice.totalAmount);

    await invoice.save();

    // Notify on full payment
    if (invoice.paymentStatus === "paid") {
      await Notification.create({
        recipient: req.user._id,
        title: "تم استلام الدفع كاملاً",
        message: `تم دفع فاتورة بمبلغ ${invoice.totalAmount} جنيه بالكامل`,
        type: "invoice",
      });
    }

    res.status(200).json({ message: "تم تسجيل الدفعة بنجاح", invoice });
  } catch (error) {
    res.status(500).json({ message: "خطأ في الخادم", error: error.message });
  }
};

// ─── Get Patient Invoices ─────────────────────────────────
// GET /api/invoices/patient/:patientId
// Access: Admin, Receptionist, Doctor
export const getPatientInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ patient: req.params.patientId })
      .populate("treatment", "status totalCost")
      .populate("issuedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ invoices, total: invoices.length });
  } catch (error) {
    res.status(500).json({ message: "خطأ في الخادم", error: error.message });
  }
};