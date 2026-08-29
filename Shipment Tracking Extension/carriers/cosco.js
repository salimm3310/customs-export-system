function processCosco(shipmentId, bookingNo, sendResponse, updateSupabaseDirectly) {
  const coscoUrl = `https://elines.coscoshipping.com/ebusiness/cargoTracking?trackingType=BOOKING&number=${encodeURIComponent(bookingNo)}`;
  chrome.tabs.create({ url: coscoUrl, active: true }, (tab) => {
    setTimeout(() => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          let etd = null, eta = null;
          function getAllDOMText(win) {
            let str = "";
            try {
              str += win.document.body ? win.document.body.innerText : "";
              win.document.querySelectorAll('iframe').forEach(f => {
                try { if (f.contentWindow && f.contentWindow.document) str += "\n" + getAllDOMText(f.contentWindow); } catch(e){}
              });
            } catch(e){}
            return str;
          }
          const fullText = getAllDOMText(window);
          const etdMatch = fullText.match(/ETD[^\d]*(\d{4}-\d{2}-\d{2})/i) || fullText.match(/(?:Departure|First POL)[^\d]*(\d{4}-\d{2}-\d{2})/i);
          if (etdMatch) etd = etdMatch[1];
          const allEtas = [...fullText.matchAll(/ETA[^\d]*(\d{4}-\d{2}-\d{2})/gi)];
          if (allEtas.length > 0) eta = allEtas[allEtas.length - 1][1];
          return { etd, eta, cutoff: null, vgm: null };
        }
      }, (results) => {
        chrome.tabs.remove(tab.id);
        if (results && results[0] && results[0].result) {
          updateSupabaseDirectly(shipmentId, results[0].result, sendResponse);
        } else {
          sendResponse({ success: false, message: "تعذر استخراج بيانات COSCO" });
        }
      });
    }, 8500);
  });
}