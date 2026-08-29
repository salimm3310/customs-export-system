console.log("⚡ [Tracker Extension] Content script loaded & listening...");

window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "FROM_PAGE_TRACKER") {
    const { shipmentId, bookingNo, carrier } = event.data;

    chrome.runtime.sendMessage({
      action: "FETCH_SILENTLY",
      shipmentId: shipmentId,
      bookingNo: bookingNo,
      carrier: carrier
    }, (response) => {
      window.postMessage({
        type: "FROM_EXTENSION_RESPONSE",
        response: response
      }, "*");
    });
  }
});