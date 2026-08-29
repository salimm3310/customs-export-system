function processMaersk(shipmentId, bookingNo, sendResponse, updateSupabaseDirectly) {
  chrome.tabs.create({
    url: `https://www.maersk.com/tracking/${encodeURIComponent(bookingNo)}`,
    active: true
  }, (tab) => {
    setTimeout(() => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          window.scrollBy(0, 200);
          let etd = null, eta = null;
          function extractAllText(element) {
            let text = element.innerText || "";
            if (element.shadowRoot) text += " " + extractAllText(element.shadowRoot);
            element.childNodes.forEach(child => { if (child.nodeType === 1) text += " " + extractAllText(child); });
            return text;
          }
          const fullText = extractAllText(document.body);
          const dateRegexStr = `(\\d{1,2}\\s+[A-Za-z]{3,}\\s+\\d{4}|\\d{4}-\\d{2}-\\d{2})`;
          const depMatch = fullText.match(new RegExp(`Vessel\\s+departure[^\\d]*${dateRegexStr}`, 'i')) || fullText.match(new RegExp(`From[^\\d]*${dateRegexStr}`, 'i'));
          if (depMatch) etd = depMatch[1];
          const arrMatch = fullText.match(new RegExp(`Vessel\\s+arrival[^\\d]*${dateRegexStr}`, 'i')) || fullText.match(new RegExp(`Estimated\\s+arrival\\s+date[^\\d]*${dateRegexStr}`, 'i'));
          if (arrMatch) eta = arrMatch[1];
          return { etd, eta, cutoff: null, vgm: null };
        }
      }, (results) => {
        chrome.tabs.remove(tab.id);
        if (results && results[0] && results[0].result) {
          updateSupabaseDirectly(shipmentId, results[0].result, sendResponse);
        } else {
          sendResponse({ success: false, message: "تعذر استخراج بيانات Maersk" });
        }
      });
    }, 6000);
  });
}