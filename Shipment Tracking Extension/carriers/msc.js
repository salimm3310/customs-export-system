// ==========================================
// 🚢 MSC Direct Tracker Engine
// ==========================================

async function handleMSC(bookingNo) {
  if (!bookingNo) return { success: false, message: "رقم الحجز مفقود" };

  const trackingUrl = `https://www.msc.com/en/track-a-shipment?number=${bookingNo}`;
  window.open(trackingUrl, '_blank');

  return {
    success: true,
    message: "تم فتح رابط التتبع لـ MSC"
  };
}