// ==========================================
// 🚢 Universal Content Script & Extractor
// ==========================================

// الاستماع لرسائل الواجهة الرئيسية
window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "START_AUTO_FETCH") {
    const { bookingNo, carrier } = event.data;
    console.log(`🔍 بدء جلب البيانات للشحنة: ${bookingNo} - ${carrier}`);
  }
});

// استخراج التواريخ المباشر من صفحة Maersk
function extractMaerskDates() {
  if (!window.location.href.includes("maersk.com/tracking")) return;

  const checkInterval = setInterval(() => {
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

      dateElements.forEach(el => {
        const text = el.innerText || el.getAttribute("datetime") || "";
        if (text.includes("ETD") || text.toLowerCase().includes("departure")) {
          extractedData.summary.etd = parseDateText(text);
        } else if (text.includes("ETA") || text.toLowerCase().includes("arrival")) {
          extractedData.summary.eta = parseDateText(text);
        }
      });

      window.postMessage(extractedData, "*");
    }
  }, 1500);
}

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

if (document.readyState === "complete" || document.readyState === "interactive") {
  extractMaerskDates();
} else {
  document.addEventListener("DOMContentLoaded", extractMaerskDates);
}