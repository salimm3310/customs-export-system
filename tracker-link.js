// ==========================================
// 🚀 Universal Tracker & Bridge Engine
// ==========================================

// ID الإضافة المثبتة في المتصفح
const EXTENSION_ID = "ckjkngbollcbhaacelldonopehlgpgaa";

// الدالة الرئيسية لتتبع جميع الخطوط
function executeUniversalTrack(bookingNo, carrier, shipmentId = null) {
  if (!bookingNo || bookingNo === 'N/A' || bookingNo === 'MISSING') {
    alert("⚠️ رقم الحجز (Booking No) غير صالح أو غير موجود.");
    return;
  }

  const carrierName = (carrier || "MAERSK").toUpperCase().trim();
  console.log(`⏳ جاري التتبع للخط [${carrierName}] - رقم الحجز: ${bookingNo}`);

  // 1. محاولة الإرسال للإضافة أولاً
  if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage(EXTENSION_ID, {
      action: "FETCH_SILENTLY",
      bookingNo: bookingNo,
      shipmentId: shipmentId,
      carrier: carrierName
    }, (response) => {
      if (chrome.runtime.lastError) {
        // في حال عدم العثور على الإضافة، نفتح الرابط المباشر
        openDirectCarrierUrl(bookingNo, carrierName);
      } else if (response && response.success) {
        console.log("✅ تم استلام استجابة الإضافة بنجاح", response);
      }
    });
  } else {
    // 2. إذا كان المتصفح لا يدعم الإضافة نفتح الرابط مباشرة
    openDirectCarrierUrl(bookingNo, carrierName);
  }
}

// دالة فتح الرابط المباشر للخط الملاحي
function openDirectCarrierUrl(bookingNo, carrierName) {
  let trackingUrl = "";

  if (carrierName.includes("MAERSK")) {
    trackingUrl = `https://www.maersk.com/tracking/${bookingNo}`;
  } else if (carrierName.includes("MSC")) {
    trackingUrl = `https://www.msc.com/en/track-a-shipment?number=${bookingNo}`;
  } else if (carrierName.includes("COSCO")) {
    trackingUrl = `https://lines.coscoshipping.com/tracking/${bookingNo}`;
  } else if (carrierName.includes("CMA")) {
    trackingUrl = `https://www.cma-cgm.com/ebusiness/tracking/search?SearchTerm=${bookingNo}`;
  } else if (carrierName.includes("HAPAG")) {
    trackingUrl = `https://www.hapag-lloyd.com/en/online-business/track/track-by-booking-solution.html?booking=${bookingNo}`;
  } else {
    trackingUrl = `https://www.google.com/search?q=${encodeURIComponent(carrierName)}+tracking+${encodeURIComponent(bookingNo)}`;
  }

  window.open(trackingUrl, '_blank');
}

// ==========================================
// 📡 مستقبل الرسائل الموحد (Auto-Fill Table)
// ==========================================
window.addEventListener("message", (event) => {
  if (!event.data) return;

  const { type, summary } = event.data;

  if (type === "MAERSK_DATES_CAPTURED" || type === "MSC_DATES_CAPTURED") {
    console.log("🎯 تم التقاط تواريخ جديدة:", summary);

    // تحديث الخانات في الواجهة تلقائياً إذا كانت موجودة
    const etdInput = document.querySelector('input[data-type="etd"]');
    const etaInput = document.querySelector('input[data-type="eta"]');

    if (etdInput && summary.etd) etdInput.value = summary.etd;
    if (etaInput && summary.eta) etaInput.value = summary.eta;

    alert(`✅ تم تحديث المواعيد تلقائياً!\n\n📅 ETD: ${summary.etd || 'غير محدد'}\n📅 ETA: ${summary.eta || 'غير محدد'}`);
  }
});