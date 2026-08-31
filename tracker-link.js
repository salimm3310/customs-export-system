// ==========================================
// 🚀 Universal Tracker Engine - Clean & Direct
// ==========================================

function executeUniversalTrack(bookingNo, carrier, shipmentId = null) {
  if (!bookingNo || bookingNo === 'N/A' || bookingNo === 'MISSING') {
    alert("⚠️ رقم الحجز (Booking No) غير صالح أو غير موجود.");
    return;
  }

  const carrierName = (carrier || "MAERSK").toUpperCase().trim();
  console.log(`🚀 جاري فتح التتبع للخط: ${carrierName} - رقم الحجز: ${bookingNo}`);

  let trackingUrl = "";

  if (carrierName.includes("MAERSK") || carrierName.includes("SEALAND")) {
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

  // فتح الرابط مباشرة في تبويب جديد دون أي قيود أو تنبيهات
  window.open(trackingUrl, '_blank');
}

// مستقبل الرسائل الموحد
window.addEventListener("message", (event) => {
  if (!event.data) return;
  const { type, summary } = event.data;

  if (type === "MAERSK_DATES_CAPTURED" || type === "MSC_DATES_CAPTURED") {
    const etdInput = document.querySelector('input[data-type="etd"]');
    const etaInput = document.querySelector('input[data-type="eta"]');

    if (etdInput && summary.etd) etdInput.value = summary.etd;
    if (etaInput && summary.eta) etaInput.value = summary.eta;
  }
});