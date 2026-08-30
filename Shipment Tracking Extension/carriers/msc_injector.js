// ==========================================
// 🚢 Live MSC Smart Injector & Extractor
// ==========================================

function processMSCPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const bookingNo = urlParams.get('number');
  const text = document.body.innerText || "";

  // 1. استخراج التواريخ فور ظهورها في الشاشة
  const etdMatch = text.match(/Estimated Time of Departure[\s\S]*?(\d{2}\/\d{2}\/\d{4})/i);
  const etaMatch = text.match(/(?:Estimated Time of Arrival|POD ETA)[\s\S]*?(\d{2}\/\d{2}\/\d{4})/i);
  const allDates = text.match(/\d{2}\/\d{2}\/\d{4}/g) || [];

  const etd = etdMatch ? etdMatch[1] : null;
  const eta = etaMatch ? etaMatch[1] : (allDates[0] || null);

  // إذا تم إيجاد البيانات، أرسلها واغلق النافذة
  if (etd || eta) {
    if (window.opener) {
      window.opener.postMessage({
        type: "MSC_DATES_CAPTURED",
        summary: { etd: etd || "غير محدد", eta: eta || "غير محدد" }
      }, "*");
      setTimeout(() => window.close(), 1000);
    }
    return;
  }

  // 2. إذا لم تظهر النتيجة وكان المربع فارغاً، أدخل رقم الحجز واضغط البحث
  const input = document.querySelector('input[name="TrackingNumber"], input[type="text"]');
  if (input && bookingNo && !input.value) {
    input.value = bookingNo;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    
    // البحث عن الزر المباشر للضغط
    const btn = document.querySelector('button[type="submit"], .msc-single-track__btn');
    if (btn) btn.click();
  }
}

// تشغيل فحص مستمر كل ثانية حتى تظهر النتائج
const mscInterval = setInterval(processMSCPage, 1200);