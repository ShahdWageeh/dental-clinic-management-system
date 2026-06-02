import Service from "../models/Service.js";

export const createService = async (req, res) => {
  try {
    const existingService = await Service.findOne({ name: req.body.name });
    if (existingService) {
      return res.status(400).json({ message: "الخدمة موجودة بالفعل" });
    }
    const service = await Service.create(req.body);
    res.status(201).json({
      message: "تم إنشاء الخدمة بنجاح",
      service,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء إنشاء الخدمة", error: error.message });
  }
};

export const getServices = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.active === "true") {
      filter.isActive = true;
    }
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: "i" };
    }
    const services = (await Service.find(filter))
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Service.countDocuments(filter);
    res.status(200).json({
      services,
      page,
      totalPages: Math.ceil(total / limit),
      totalServices: total,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء جلب الخدمات", error: error.message });
  }
};

export const getSingleService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "الخدمة غير موجودة" });
    }
    res.status(200).json(service);
  } catch (error) {
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء جلب الخدمة", error: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "الخدمة غير موجودة" });
    }
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    res.status(200).json({
      message: "تم تعديل الخدمة بنجاح",
      service: updatedService,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "حدث خطأ أثناء تعديل الخدمة", error: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "الخدمة غير موجودة" });
    }
    service.isActive = false;
    await service.save();
    res.status(200).json({
      message: "تم الغاء الخدمة بنجاح",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء حذف الخدمة", error: error.message });
  }
};

export const restoreService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "الخدمة غير موجودة" });
    }
    service.isActive = true;
    await service.save();
    res.status(200).json({
      message: "تم استعادة الخدمة بنجاح",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء استعادة الخدمة", error: error.message });
  }
};
