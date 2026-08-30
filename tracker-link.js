// ==========================================
// 🚀 Tracker Link - Universal Carrier Engine
// ==========================================

function triggerTrackerExtension(shipmentId, bookingNo, carrier) {
  if (!bookingNo || bookingNo === 'N/A' || bookingNo === 'MISSING') {
    alert("⚠️ رقم الحجز (Booking No) غير صالح أو غير موجود.");
    return;
  }

  // قراءة اسم الخط الملاحي وتنظيفه
  const carrierName = (carrier || "MAERSK").toUpperCase().trim();
  console.log(`⏳ جاري طلب التتبع للخط [${carrierName}] - رقم الحجز: ${bookingNo}`);

  let trackingUrl = "";

  if (carrierName.includes("MAERSK")) {
    trackingUrl = `https://www.maersk.com/tracking/${bookingNo}`;
  } else if (carrierName.includes("MSC")) {
    trackingUrl = `https://www.msc.com/en/track-a-shipment?number=${bookingNo}`;
  } else if (carrierName.includes("COSCO")) {
    trackingUrl = `https://lines.coscoshipping.com/tracking/${bookingNo}`;
  } else if (carrierName.includes("CMA")) {
    trackingUrl = `https://www.cma-cgm.com/ebusiness/tracking/search?SearchTerm=${bookingNo}`;
  } else if (carrierName.includes("EVERGREEN")) {
    trackingUrl = `https://www.shipmentlink.com/servlet/TIDE__L_CargoTracking?nos=${bookingNo}`;
  } else {
    // أي خط ملاحي آخر غير معرف يفتح نتائج البحث المباشرة
    trackingUrl = `https://www.google.com/search?q=${encodeURIComponent(carrierName)}+tracking+${encodeURIComponent(bookingNo)}`;
  }

  // فتح صفحة التتبع الرسمية للشحنة في تبويب جديد
  window.open(trackingUrl, '_blank');
}

// استقبال التواريخ إذا تم التقاطها بواسطة الإضافة
window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "MSC_DATES_CAPTURED") {
    const { etd, eta } = event.data.summary;
    alert(`✅ تم جلب التواريخ بنجاح!\n\n📅 ETD (المغادرة): ${etd}\n📅 ETA (الوصول): ${eta}`);
    location.reload();
  }
});