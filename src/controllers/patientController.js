import Patient from "../models/Patient.js";

export const createPatient = async (req, res) => {
  try {
    const patient = await Patient.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json({ message: "تم اضافة المريض بنجاح", patient });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء اضافة المريض" });
  }
};

export const getPatients = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const keyword = req.query.search
      ? {
          fullName: { $regex: req.query.search, $options: "i" },
        }
      : {};
    const patients = await Patient.find(keyword)
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPatients = await Patient.countDocuments(keyword);

    res.status(200).json({
      patients,
      page,
      totalPages: Math.ceil(totalPatients / limit),
      totalPatients,
    });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء جلب المرضى" });
  }
};

export const getSinglePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate(
      "createdBy",
      "name role",
    );
    if (!patient) {
      return res.status(404).json({
        message: "المريض غير موجود",
      });
    }
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: "المريض غير موجود" });
    }
    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true },
    );
    res.status(200).json({
      message: "تم تحديث بيانات المريض بنجاح",
      patient: updatedPatient,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "حدث خطأ أثناء تحديث بيانات المريض" });
  }
};

export const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: "المريض غير موجود" });
    }
    await patient.deleteOne();
    res.status(200).json({ message: "تم حذف المريض بنجاح" });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "حدث خطأ أثناء حذف المريض" });
  }
};

export const uploadXrays = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: "المريض غير موجود" });
    }
    const uploadImages = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));
    patient.xraysImages.push(...uploadImages);
    await patient.save();
    res.status(200).json({
      message: "تم رفع الاشعة بنجاح",
      images: patient.xraysImages,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "حدث خطأ أثناء رفع الاشعة" });
  }
};
