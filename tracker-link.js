// ==========================================
// 🚀 Tracker Link - Direct Tracking Integration
// ==========================================

function triggerTrackerExtension(shipmentId, bookingNo, carrier) {
  if (!bookingNo || bookingNo === 'N/A') {
    alert("⚠️ رقم الحجز (Booking No) غير صالح أو غير موجود.");
    return;
  }

  const carrierName = (carrier || "MSC").toUpperCase();

  if (carrierName.includes("MSC")) {
    const trackingUrl = `https://www.msc.com/en/track-a-shipment?number=${bookingNo}`;
    
    // فتح التبويب مباشرة ليتحمل السكريبت حياً أمامك وتتجاوز الحظر
    const trackingWindow = window.open(trackingUrl, '_blank');

    console.log(`⏳ تم فتح صفحة تتبع MSC للحجز: ${bookingNo}`);
  } else {
    alert(`ℹ️ الخط الملاحي [${carrierName}] غير مدعوم حالياً. المدعوم حالياً: MSC.`);
  }
}

// الاستماع للتواريخ المستخرجة فور إرسالها من صفحة MSC
window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "MSC_DATES_CAPTURED") {
    const { etd, eta } = event.data.summary;
    alert(`✅ تم التتبع بنجاح!\n\n📅 ETD (المغادرة): ${etd}\n📅 ETA (الوصول): ${eta}`);
    location.reload();
  }
});