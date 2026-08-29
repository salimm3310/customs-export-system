// ==========================================
// 🚀 Background Engine - Event Based Tracking
// ==========================================

let activeTrackingResolver = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 1. استقبال طلب الجلب من برنامجك
  if (request.action === "FETCH_SILENTLY") {
    const url = `https://www.msc.com/en/track-a-shipment?number=${request.bookingNo}`;

    chrome.tabs.create({ url: url, active: false }, (tab) => {
      const tabId = tab.id;

      // ضبط مؤقت طوارئ لمدة 12 ثوانٍ
      const timeout = setTimeout(() => {
        chrome.tabs.remove(tabId);
        sendResponse({ success: false, message: "انتهى وقت الانتظار دون استجابة موقع MSC." });
      }, 12000);

      // تخزين دالة الرد لاستدعائها فور عثور المحقن على التواريخ
      activeTrackingResolver = (data) => {
        clearTimeout(timeout);
        chrome.tabs.remove(tabId);
        sendResponse({
          success: true,
          hasDates: true,
          summary: data
        });
      };
    });

    return true; // إبقاء الاتصال مفتوحاً
  }

  // 2. استقبال التواريخ المستخرجة من صفحة MSC
  if (request.action === "MSC_DATES_FOUND" && activeTrackingResolver) {
    activeTrackingResolver(request.summary);
    activeTrackingResolver = null;
  }
});