import Treatment from "./../models/Treatment.js";
import Appointment from "./../models/Appointment.js";
import Service from "./../models/Service.js";

export const createTreatment = async (req, res) => {
  try {
    const { appointment, services, treatmentNotes } = req.body;
    const existingTreatment = await Treatment.findOne({ appointment });
    if (existingTreatment) {
      return res.status(400).json({ message: "يوجد خطة علاج بالفعل" });
    }
    const appointmentData = await Appointment.findById(appointment);
    if (!appointmentData) {
      return res.status(404).json({ message: "الحجز غير موجود" });
    }
    let totalCost = 0;
    const treatmentServices = [];
    for (const item of services) {
      const serviceData = await Service.findById(item.Service);
      if (!serviceData) {
        return res.status(404).json({ message: "الخدمة غير موجودة" });
      }
      const itemTotal = serviceData.price * item.quantity;
      totalCost += itemTotal;
      treatmentServices.push({
        service: serviceData._id,
        quantity: item.quantity,
        price: serviceData.price,
      });
    }
    const treatment = await Treatment.create({
      appointment,
      patient: appointmentData.patient,
      doctor: appointmentData.doctor,
      services: treatmentServices,
      totalCost,
      treatmentNotes,
    });
    res.status(201).json({
      message: "تم انشاء خطة العلاج بنجاح",
      treatment,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء إنشاء العلاج", error: error.message });
  }
};

export const getTreatments = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.doctor) {
      filter.doctor = req.query.doctor;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const treatments = await Treatment.find(filter)
      .populate("patient", "fullName")
      .populate("doctor", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Treatment.countDocuments(filter);
    res.status(200).json({
      treatments,
      page,
      totalPages: Math.ceil(total / limit),
      totalTreatments: total,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء جلب خطط العلاج", error: error.message });
  }
};

export const getSingleTreatment = async (req, res) => {
  try {
    const treatment = await Treatment.findById(req.params.id);
    if (!treatment) {
      return res.status(404).json({ message: "خطة العلاج غير موجودة" });
    }
    res.status(200).json({ treatment });
  } catch (error) {
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء جلب خطة العلاج", error: error.message });
  }
};

export const updateTreatment = async (req, res) => {
  try {
    const treatment = await Treatment.findById(req.params.id);
    if (!treatment) {
      return res.status(404).json({ message: "خطة العلاج غير موجودة" });
    }
    if (treatment.status === "مكتمل") {
      return res.status(400).json({ message: "لا يمكن تعديل خطة علاج مكتملة" });
    }
    if (treatment.status === "ملغى") {
      return res.status(400).json({ message: "لا يمكن تعديل خطة علاج ملغاة" });
    }
    let totalCost = 0;
    const updatedServices = [];
    for (const item of req.body.services) {
      const service = await Service.findById(item.Service);
      if (!service) {
        return res.status(404).json({ message: "الخدمة غير موجودة" });
      }
      totalCost += service.price * item.quantity;
      updatedServices.push({
        service: service._id,
        quantity: item.quantity,
        price: service.price,
      });
    }
    treatment.services = updatedServices;
    treatment.totalCost = totalCost;
    if (req.body.treatmentNotes !== undefined) {
      treatment.treatmentNotes = req.body.treatmentNotes;
    }
    if (req.body.status) {
      treatment.status = req.body.status;
    }
    await treatment.save();
    res.status(200).json({
      message: "تم تعديل خطة العلاج بنجاح",
      treatment,
    });
  } catch (error) {
    res.status(500).json({
      message: "حدث خطأ أثناء تعديل خطة العلاج",
      error: error.message,
    });
  }
};

export const cancelTreatment = async (req, res) => {
  try {
    const treatment = await Treatment.findById(req.params.id);
    if (!treatment) {
      return res.status(404).json({ message: "خطة العلاج غير موجودة" });
    }
    if (treatment.status === "مكتمل") {
      return res.status(400).json({ message: "لا يمكن إلغاء خطة علاج مكتملة" });
    }
    if (treatment.status === "ملغى") {
      return res.status(400).json({ message: "خطة العلاج ملغاة بالفعل" });
    }
    treatment.status = "ملغى";
    await treatment.save();
    await Appointment.findByIdAndUpdate(treatment.appointment, {
      status: "ملغى",
    });
    res.status(200).json({
      message: "تم إلغاء خطة العلاج بنجاح",
      treatment,
    });
  } catch (error) {
    res.status(500).json({
      message: "حدث خطأ أثناء إلغاء خطة العلاج",
      error: error.message,
    });
  }
};

export const completeTreatment = async (req, res) => {
  try {
    const treatment = await Treatment.findById(req.params.id);
    if (!treatment) {
      return res.status(404).json({ message: "خطة العلاج غير موجودة" });
    }
    if (treatment.status === "مكتمل") {
      return res.status(400).json({ message: "خطة العلاج مكتملة بالفعل" });
    }
    if (treatment.status === "ملغى") {
      return res.status(400).json({ message: "لا يمكن اكمال خطة علاج ملغاه" });
    }
    treatment.status = "مكتمل";
    await treatment.save();
    await Appointment.findByIdAndUpdate(treatment.appointment, {
      status: "مكتمل",
    });
    res.status(200).json({
      message: "تم إكمال خطة العلاج بنجاح",
      treatment,
    });
  } catch (error) {
    res.status(500).json({
      message: "حدث خطأ أثناء إكمال خطة العلاج",
      error: error.message,
    });
  }
};
