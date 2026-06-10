import Notification from "../models/Notification.js";
import User from "../models/User.js";

// بعت notification لكل الـ admins
export const notifyAdmins = async (title, message) => {
  const admins = await User.find({ role: "admin" }).select("_id");
  const notifications = admins.map((admin) => ({
    recipient: admin._id,
    title,
    message,
  }));
  await Notification.insertMany(notifications);
};