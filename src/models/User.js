import moongose from "mongoose";

const userSchema = new moongose.Schema(
  {
    name: {
      type: String,
      required: [true, "الاسم مطلوب"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "البريد الإلكتروني مطلوب"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "كلمة المرور مطلوبة"],
      minlength: [6, "كلمة المرور يجب أن تكون على الأقل 6 أحرف"],
    },
    role: {
      type: String,
      enum: ["admin", "doctor", "receptionist"],
      default: "receptionist",
    },
    phone: {
      type: String,
    },
    specialization: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordOTP: {
      type: String
    },
    resetPasswordExpire: {
      type: Date
    },
  },
  { timestamps: true },
);

const User = moongose.model("User", userSchema);

export default User;
