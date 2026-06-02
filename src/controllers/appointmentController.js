import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import User from "../models/User.js";

export const createAppointment = async (req, res) => {
  try {
    const { patient, doctor, appointmentDate, appointmentTime, reason, notes } =
      req.body;
    const existingPatient = await Patient.findById(patient);
    if (!existingPatient) {
      res.status(404).json({ message: "المريض غير موجود" });
    }
    const existingDoctor = await User.findById(doctor);
    if (!existingDoctor) {
      res.status(404).json({ message: "الطبيب غير موجود" });
    }
    if (existingDoctor.role !== "doctor") {
      res.status(400).json({ message: "المستخدم ليس طبيب" });
    }
    const existingAppointment = await Appointment.findOne({
      doctor,
      appointmentDate,
      appointmentTime,
      status: { $ne: "ملغي" },
    });
    if (existingAppointment) {
      res.status(400).json({ message: "هذا الموعد محجوز بالفعل" });
    }
    const appointment = await Appointment.create({
      patient,
      doctor,
      appointmentDate,
      appointmentTime,
      reason,
      notes,
      createdBy: req.user._id,
    });
    res.status(201).json({ message: "تم إنشاء الموعد بنجاح", appointment });
  } catch (error) {
    res.status(500).json({ message: "خطأ في الخادم" || error.message });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const page = Number(req.query.pqge) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.doctor) {
      filter.doctor = req.query.doctor;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.date) {
      filter.appointmentDate = req.query.date;
    }
    const appointments = await Appointment.find(filter)
      .populate("patient", "fullName phone")
      .populate("doctor", "name specialization")
      .populate("createdBy", "name role")
      .sort({ appointmentDate: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Appointment.countDocuments(filter);
    res.status(200).json({
      appointments,
      page,
      totalPages: Math.ceil(total / limit),
      totalAppointments: total,
    });
  } catch (error) {
    res.status(500).json({ message: "خطأ في الخادم" || error.message });
  }
};

export const getSingleAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient")
      .populate("doctor", "name specialization");

    if (!appointment) {
      return res.status(404).json({ message: "الحجز غير موجود" });
    }
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: "خطأ في الخادم" || error.message });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "الحجز غير موجود" });
    }
    if (
      req.body.doctor &&
      req.body.appointmentDate &&
      req.body.appointmentTime
    ) {
      const existingAppointment = await Appointment.findOne({
        _id: { $ne: req.params.id },
        doctor: req.body.doctor,
        appointmentDate: req.body.appointmentDate,
        appointmentTime: req.body.appointmentTime,
        status: { $ne: "ملغي" },
      });
      if (existingAppointment) {
        return res.status(400).json({ message: "هذا الموعد محجوز بالفعل" });
      }
    }
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    res.status(200).json({
      message: "تم تحديث الحجز بنجاح",
      appointment: updatedAppointment,
    });
  } catch (error) {
    res.status(500).json({ message: "خطأ في الخادم" || error.message });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "الحجز غير موجود" });
    }
    appointment.status = "ملغي";
    await appointment.save();
    res.status(200).json({ message: "تم إلغاء الحجز بنجاح" });
  } catch (error) {
    res.status(500).json({ message: "خطأ في الخادم" || error.message });
  }
};

export const completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "الحجز غير موجود" });
    }
    appointment.status = "مكتمل";
    await appointment.save();
    res.status(200).json({ message: "تم انهاء الحجز بنجاح" });
  } catch (error) {
    res.status(500).json({ message: "خطأ في الخادم" || error.message });
  }
};
