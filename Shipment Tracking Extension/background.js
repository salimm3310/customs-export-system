// ==========================================
// 🚀 Tracker Extension - Background Engine (Tab Injector)
// ==========================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "FETCH_SILENTLY") {
    console.log(`🚀 [Background] جاري تتبع الشحنة لـ ${request.carrier}: ${request.bookingNo}`);

    if ((request.carrier || '').toUpperCase().includes("MSC")) {
      trackMSCViaTab(request.bookingNo).then(res => sendResponse(res));
      return true; // للحفاظ على القناة مفتوحة
    } else {
      sendResponse({ success: false, message: `جاري إضافة دعم الخط ${request.carrier} قريباً.` });
    }
  }
});

// دالة تفتح التبويب وتجلب التواريخ بعد تحميل العناصر Dynamic
async function trackMSCViaTab(bookingNo) {
  return new Promise((resolve) => {
    const url = `https://www.msc.com/en/track-a-shipment?number=${bookingNo}`;

    // 1. فتح تبويب جديد (مخفي/خلفي)
    chrome.tabs.create({ url: url, active: false }, (tab) => {
      const tabId = tab.id;

      // الانتظار 6 ثوانٍ لضمان تحميل React والبيانات في الصفحة
      setTimeout(() => {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: () => {
            const bodyText = document.body.innerText || "";
            
            // استخراج ETD و ETA باستخدام Regex من نص الصفحة الحقيقي
            const etdMatch = bodyText.match(/Estimated Time of Departure[\s\S]*?(\d{2}\/\d{2}\/\d{4})/i);
            const etaMatch = bodyText.match(/(?:Estimated Time of Arrival|POD ETA)[\s\S]*?(\d{2}\/\d{2}\/\d{4})/i);

            // استخراج إضافي بالأنماط العامة إذا فشل المباشر
            const allDates = bodyText.match(/\d{2}\/\d{2}\/\d{4}/g) || [];

            const etd = etdMatch ? etdMatch[1] : (allDates[1] || allDates[0] || null);
            const eta = etaMatch ? etaMatch[1] : (allDates[0] || null);

            return { etd, eta };
          }
        }, (results) => {
          // إغلاق التبويب المؤقت
          chrome.tabs.remove(tabId);

          if (results && results[0] && results[0].result) {
            const { etd, eta } = results[0].result;
            if (etd || eta) {
              resolve({
                success: true,
                hasDates: true,
                summary: {
                  etd: etd || 'غير محدد',
                  eta: eta || 'غير محدد'
                }
              });
              return;
            }
          }

          resolve({
            success: false,
            message: "لم نتمكن من التقاط التواريخ من الصفحة الحية."
          });
        });
      }, 6000); // 6 ثوانٍ كافية لصفحة MSC
    });
  });
}