// ==========================================
// 🚀 Universal Extension Background Engine
// ==========================================

// الاستماع للرسائل القادمة من مواقع الخارجية (صفحة index.html)
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  if (request.action === "FETCH_SILENTLY" || request.action === "open_tracker") {
    const bookingNo = request.bookingNo;
    const carrier = (request.carrier || "MAERSK").toUpperCase().trim();

    let url = "";
    if (carrier.includes("MAERSK")) {
      url = `https://www.maersk.com/tracking/${bookingNo}`;
    } else if (carrier.includes("MSC")) {
      url = `https://www.msc.com/en/track-a-shipment?number=${bookingNo}`;
    } else if (carrier.includes("COSCO")) {
      url = `https://lines.coscoshipping.com/tracking/${bookingNo}`;
    } else if (carrier.includes("CMA")) {
      url = `https://www.cma-cgm.com/ebusiness/tracking/search?SearchTerm=${bookingNo}`;
    } else {
      url = `https://www.google.com/search?q=${encodeURIComponent(carrier)}+tracking+${encodeURIComponent(bookingNo)}`;
    }

    // فتح الرابط في تبويب نشط فوراً
    chrome.tabs.create({ url: url, active: true }, (tab) => {
      sendResponse({ success: true, status: "SUCCESS", tabId: tab.id, url: url });
    });

    return true; // Asynchronous response
  }
});

// الاستماع للرسائل الداخلية من محتوى الإضافة
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "open_tracker" || request.type === "START_TRACKING") {
    const carrier = (request.carrier || "MAERSK").toUpperCase().trim();
    const bookingNo = request.bookingNo;
    
    let url = `https://www.maersk.com/tracking/${bookingNo}`;
    if (carrier.includes("MSC")) {
      url = `https://www.msc.com/en/track-a-shipment?number=${bookingNo}`;
    }

    chrome.tabs.create({ url: url, active: true });
    sendResponse({ status: "SUCCESS", url: url });
  }
  return true;
});