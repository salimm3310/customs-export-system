// ==========================================
// 🚀 Tracker Link - Direct MSC Navigation
// ==========================================

function triggerTrackerExtension(shipmentId, bookingNo, carrier) {
  if (!bookingNo || bookingNo === 'N/A') {
    alert("⚠️ رقم الحجز (Booking No) غير صالح أو غير موجود.");
    return;
  }

  const carrierName = (carrier || "MSC").toUpperCase();

  if (carrierName.includes("MSC")) {
    // الرابط المباشر لصفحة تتبع الحاويات الشغالة حالياً في MSC
    const trackingUrl = `https://www.msc.com/en/track-a-shipment?agencyPath=nzl&number=${bookingNo}`;
    
    // فتح النافذة في تبويب منفصل
    window.open(trackingUrl, 'msc_tracker_tab');
    console.log(`⏳ تم فتح صفحة تتبع MSC للحجز: ${bookingNo}`);
  } else {
    alert(`ℹ️ الخط الملاحي [${carrierName}] غير مدعوم حالياً. المدعوم حالياً: MSC.`);
  }
}

// الاستماع للنتائج من التبويب المفتوح
window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "MSC_DATES_CAPTURED") {
    const { etd, eta } = event.data.summary;
    alert(`✅ تم جلب التواريخ بنجاح!\n\n📅 ETD (المغادرة): ${etd}\n📅 ETA (الوصول): ${eta}`);
    location.reload();
  }
});