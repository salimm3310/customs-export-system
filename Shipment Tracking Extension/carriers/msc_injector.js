// ==========================================
// 🚢 MSC Page Live Extractor
// ==========================================

function extractMSCDates() {
  const bodyText = document.body.innerText || "";
  
  // استخراج ETD و ETA ببحث مباشر في نص الصفحة
  const etdMatch = bodyText.match(/Estimated Time of Departure[\s\S]*?(\d{2}\/\d{2}\/\d{4})/i);
  const etaMatch = bodyText.match(/(?:Estimated Time of Arrival|POD ETA)[\s\S]*?(\d{2}\/\d{2}\/\d{4})/i);
  const allDates = bodyText.match(/\d{2}\/\d{2}\/\d{4}/g) || [];

  const etd = etdMatch ? etdMatch[1] : (allDates[1] || null);
  const eta = etaMatch ? etaMatch[1] : (allDates[0] || null);

  if (etd || eta) {
    chrome.runtime.sendMessage({
      action: "MSC_DATES_FOUND",
      summary: { etd: etd || 'غير محدد', eta: eta || 'غير محدد' }
    });
  }
}

// مراقبة التغييرات في الصفحة لضمان استخراج البيانات فور ظهورها
const observer = new MutationObserver(() => {
  extractMSCDates();
});

observer.observe(document.body, { childList: true, subtree: true });

// تشغيل فحص إضافي بعد ثوانٍ من التحميل
setTimeout(extractMSCDates, 3000);
setTimeout(extractMSCDates, 6000);