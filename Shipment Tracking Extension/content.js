// ==========================================
// 🔗 Tracker Extension - Content Script
// ==========================================

console.log("⚡ [Tracker Extension] Content script loaded & listening...");

// 1. الاستماع للأحداث القادمة من صفحة HTML (tracker-link.js)
window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "FROM_PAGE_TRACKER") {
    const { shipmentId, bookingNo, carrier } = event.data;
    console.log(`📡 [Content Script] تم استلام طلب تتبع لـ ${carrier} - رقم: ${bookingNo}`);

    // 2. التمرير إلى background.js الخاص بالإضافة
    chrome.runtime.sendMessage({
      action: "FETCH_SILENTLY",
      shipmentId: shipmentId,
      bookingNo: bookingNo,
      carrier: carrier
    }, (response) => {
      // التعامل مع أخطاء الاتصال الداخلي
      const finalResponse = chrome.runtime.lastError 
        ? { success: false, message: "فشل الاتصال بـ background.js: " + chrome.runtime.lastError.message }
        : response;

      // 3. إعادة النتيجة لصفحة HTML
      window.postMessage({
        type: "FROM_EXTENSION_RESPONSE",
        response: finalResponse
      }, "*");
    });
  }
});