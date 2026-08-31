// ==========================================
// 🚀 Universal Content Engine - Clean Bridge
// ==========================================

// الاستماع لرسائل التتبع من الواجهة وتوجيهها بدون شروط
window.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "START_AUTO_FETCH" || event.data.action === "open_tracker") {
    const bookingNo = event.data.bookingNo;
    const carrier = (event.data.carrier || "MAERSK").toUpperCase().trim();

    console.log(`🌐 جاري توجيه التتبع للخط الملاحي: ${carrier} برقم الحجز: ${bookingNo}`);

    let url = `https://www.maersk.com/tracking/${bookingNo}`;

    if (carrier.includes("MSC")) {
      url = `https://www.msc.com/en/track-a-shipment?number=${bookingNo}`;
    } else if (carrier.includes("COSCO")) {
      url = `https://lines.coscoshipping.com/tracking/${bookingNo}`;
    } else if (carrier.includes("CMA")) {
      url = `https://www.cma-cgm.com/ebusiness/tracking/search?SearchTerm=${bookingNo}`;
    } else if (carrier.includes("HAPAG")) {
      url = `https://www.hapag-lloyd.com/en/online-business/track/track-by-booking-solution.html?booking=${bookingNo}`;
    }

    window.open(url, '_blank');
  }
});