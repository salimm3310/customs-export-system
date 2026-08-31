// ==========================================
// 🚀 Universal Carrier Tracker - Background Engine
// ==========================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "open_tracker" || request.type === "START_TRACKING") {
    const carrier = (request.carrier || "MAERSK").toUpperCase().trim();
    const bookingNo = request.bookingNo;
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

    chrome.tabs.create({ url: url, active: true });
    sendResponse({ status: "SUCCESS", url: url });
  }
  return true;
});