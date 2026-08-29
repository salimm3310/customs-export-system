// ==========================================
// 🚀 Tracker Extension - Background Engine
// ==========================================

// استدعاء ملفات الخطوط الملاحية المتاحة
try {
  importScripts('carriers/msc.js');
} catch (e) {
  console.error("لم يتم العثور على ملفات الخطوط الملاحية:", e);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "FETCH_SILENTLY") {
    console.log(`🚀 [Background] استقبال طلب تتبع لـ [${request.carrier}] - رقم الحجز: ${request.bookingNo}`);

    const carrierUpper = (request.carrier || '').toUpperCase();

    // 1. التعامل مع خط MSC
    if (carrierUpper.includes("MSC") && typeof handleMSC === "function") {
      handleMSC(request.bookingNo)
        .then(result => sendResponse(result))
        .catch(err => sendResponse({ success: false, message: "خطأ أثناء معالجة موقع MSC: " + err.message }));
      return true; // إبقاء القناة مفتوحة للردAsync
    } 
    
    // 2. إذا كان الخط الملاحي غير مدعوم بعد في الإضافة
    else {
      sendResponse({ 
        success: false, 
        message: `محرك الجلب الآلي لخط [${request.carrier}] جاري تطويره حالياً. مدعوم حالياً: MSC.` 
      });
    }
  }
});