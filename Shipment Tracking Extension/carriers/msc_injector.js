// ==========================================
// 🚢 Live MSC Smart Extractor
// ==========================================

function extractMSCDates() {
  const text = document.body.innerText || "";

  const etdMatch = text.match(/Estimated Time of Departure[\s\S]*?(\d{2}\/\d{2}\/\d{4})/i);
  const etaMatch = text.match(/(?:Estimated Time of Arrival|POD ETA)[\s\S]*?(\d{2}\/\d{2}\/\d{4})/i);
  const allDates = text.match(/\d{2}\/\d{2}\/\d{4}/g) || [];

  const etd = etdMatch ? etdMatch[1] : null;
  const eta = etaMatch ? etaMatch[1] : (allDates[0] || null);

  if (etd || eta) {
    if (window.opener) {
      window.opener.postMessage({
        type: "MSC_DATES_CAPTURED",
        summary: { etd: etd || "غير محدد", eta: eta || "غير محدد" }
      }, "*");
      setTimeout(() => window.close(), 1000);
    }
  }
}

setInterval(extractMSCDates, 1500);