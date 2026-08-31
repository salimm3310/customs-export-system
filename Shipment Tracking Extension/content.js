// ==========================================
// 🚢 Maersk & Universal Data Extractor
// ==========================================

// الاستماع لرسائل الصفحة الرئيسية
window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "START_AUTO_FETCH") {
    const { bookingNo, carrier } = event.data;
    console.log(`🔍 بدء جلب البيانات تلقائياً للشحنة: ${bookingNo}`);
  }
});

// دالة فحص وتفريغ بيانات Maersk من الـ DOM
function extractMaerskDates() {
  if (!window.location.href.includes("maersk.com/tracking")) return;

  // الانتظار لحين تحميل عناصر التواريخ
  const checkInterval = setInterval(() => {
    // محددات العناصر الحاوية للتواريخ داخل صفحة Maersk
    const dateElements = document.querySelectorAll('[data-test="estimated-time-arrival"], [data-test="estimated-time-departure"], .dl-event__date, time');

    if (dateElements.length > 0) {
      clearInterval(checkInterval);

      let extractedData = {
        type: "MAERSK_DATES_CAPTURED",
        summary: {
          etd: "",
          eta: "",
          cutOff: ""
        }
      };

      // تحليل القيم واستخراج التواريخ
      dateElements.forEach(el => {
        const text = el.innerText || el.getAttribute("datetime") || "";
        if (text.includes("ETD") || text.toLowerCase().includes("departure")) {
          extractedData.summary.etd = parseDateText(text);
        } else if (text.includes("ETA") || text.toLowerCase().includes("arrival")) {
          extractedData.summary.eta = parseDateText(text);
        }
      });

      console.log("✅ تم استخراج التواريخ بنجاح:", extractedData.summary);

      // إعادة التواريخ إلى برنامجك الرئيسي
      window.postMessage(extractedData, "*");
    }
  }, 1500);
}

// دالة مساعدة لتنسيق التواريخ لتقبلها حقول <input type="date">
function parseDateText(rawText) {
  const match = rawText.match(/\d{4}-\d{2}-\d{2}/) || rawText.match(/\d{1,2}\s+[A-Za-z]+\s+\d{4}/);
  if (match) {
    const d = new Date(match[0]);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  }
  return "";
}

// تشغيل الفحص فور تحميل الصفحة
if (document.readyState === "complete" || document.readyState === "interactive") {
  extractMaerskDates();
} else {
  document.addEventListener("DOMContentLoaded", extractMaerskDates);
}