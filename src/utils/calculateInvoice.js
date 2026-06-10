// بتحسب الـ payment status بناءً على المدفوع والإجمالي
export const calcPaymentStatus = (paid, total) => {
  if (paid <= 0) return "pending";
  if (paid >= total) return "paid";
  return "partial";
};

// بتحسب الـ totalAmount بعد الخصم
export const calcTotalAmount = (subtotal, discount = 0) => {
  const total = subtotal - discount;
  if (total < 0) return null; // الخصم أكبر من الإجمالي
  return total;
};