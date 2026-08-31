// ==========================================
// 🚀 Universal Tracker & Bridge Engine
// ==========================================

// الـ ID الخاص بالإضافة المثبتة في متصفحك
const EXTENSION_ID = "gkheekkmikemniiekdplaicmojfnfhdo";

function executeUniversalTrack(bookingNo, carrier, shipmentId = null) {
  if (!bookingNo || bookingNo === 'N/A' || bookingNo === 'MISSING') {
    alert("⚠️ رقم الحجز (Booking No) غير صالح أو غير موجود.");
    return;
  }

  const carrierName = (carrier || "MAERSK").toUpperCase().trim();
  console.log(`⏳ جاري التتبع للخط [${carrierName}] - رقم الحجز: ${bookingNo}`);

  // إرسال الطلب مباشرة للإضافة بواسطة الـ ID الخاص بها
  if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage(EXTENSION_ID, {
      action: "FETCH_SILENTLY",
      bookingNo: bookingNo,
      shipmentId: shipmentId,
      carrier: carrierName
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn("⚠️ تعذر الاتصال بالإضافة مباشرة، جاري فتح الرابط المباشر:", chrome.runtime.lastError.message);
        openDirectCarrierUrl(bookingNo, carrierName);
      } else if (response && response.success) {
        console.log("✅ تم استلام الاستجابة من الإضافة بنجاح", response);
      }
    });
  } else {
    openDirectCarrierUrl(bookingNo, carrierName);
  }
}

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