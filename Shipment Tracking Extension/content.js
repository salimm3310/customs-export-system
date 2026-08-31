// ==========================================
// 🚢 Universal Content Script - Multi Carrier
// ==========================================

window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "FROM_PAGE_TRACKER") {
    const { bookingNo, carrier } = event.data;
    const carrierName = (carrier || "").toUpperCase();

    console.log(`🌐 الإضافة تلقت طلب تتبع للخط [${carrierName}] برقم: ${bookingNo}`);

    // إرسال الأمر للـ background لفتح التتبع لكل الخطوط الملاحية
    chrome.runtime.sendMessage({
      action: "open_tracker",
      bookingNo: bookingNo,
      carrier: carrierName
    });
  }
});