// ==========================================
// 🚢 Live MSC Auto-Extractor
// ==========================================

function checkAndSendDates() {
  const text = document.body.innerText || "";
  
  // البحث عن التواريخ بمرونة من نص الصفحة
  const etdMatch = text.match(/Estimated Time of Departure[\s\S]*?(\d{2}\/\d{2}\/\d{4})/i);
  const etaMatch = text.match(/(?:Estimated Time of Arrival|POD ETA)[\s\S]*?(\d{2}\/\d{2}\/\d{4})/i);
  const dates = text.match(/\d{2}\/\d{2}\/\d{4}/g) || [];

  const etd = etdMatch ? etdMatch[1] : (dates[1] || null);
  const eta = etaMatch ? etaMatch[1] : (dates[0] || null);

  if (etd || eta) {
    const payload = {
      type: "MSC_DATES_CAPTURED",
      summary: { etd: etd || "غير محدد", eta: eta || "غير محدد" }
    };

    // إرسال البيانات للنافذة الرئيسية إما عبر opener أو postMessage
    if (window.opener) {
      window.opener.postMessage(payload, "*");
    }
  }
}

// فحص تتابع التحميل Dynamically
setInterval(checkAndSendDates, 2000);