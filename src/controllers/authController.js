import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, specialization } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "البريد الإلكتروني مستخدم بالفعل",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      specialization,
    });
    const token = generateToken(user._id, user.role);
    res.status(201).json({
      message: "تم إنشاء الحساب بنجاح",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "حدث خطأ أثناء إنشاء الحساب",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "بيانات تسجيل الدخول غير صحيحة",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "بيانات تسجيل الدخول غير صحيحة",
      });
    }
    const token = generateToken(user._id, user.role);
    res.status(200).json({
      message: "تم تسجيل الدخول بنجاح",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "حدث خطأ أثناء تسجيل الدخول",
      error: error.message,
    });
  }
};

export const getMe = async (req, res) => {
  res.status(200).json(req.user);
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "لا يوجد مستخدم بهذا البريد الإلكتروني",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");
    user.resetPasswordOTP = hashedOTP;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();
    // const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${otp}`;
    const message = `رمز اعادة تعيين كلمة المرور : ${otp} 
    صالح ل 15 دقيقة فقط.`;
    await sendEmail(user.email, "إعادة تعيين كلمة المرور", message);
    res.status(200).json({
      success: true,
      message: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
    });
  } catch (error) {
    res.status(500).json({
      message: "حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور",
      error: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const hashedOTP = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");
    const user = await User.findOne({
      email,
      resetPasswordOTP: hashedOTP,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        message: "رابط إعادة تعيين كلمة المرور غير صالح أو انتهت صلاحيته",
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(200).json({
      success: true,
      message: "تم إعادة تعيين كلمة المرور بنجاح",
    });
  } catch (error) {
    res.status(500).json({
      message: "حدث خطأ أثناء إعادة تعيين كلمة المرور",
      error: error.message,
    });
  }
};
