function processHapag(shipmentId, bookingNo, sendResponse, updateSupabaseDirectly) {
  chrome.tabs.create({
    url: `https://www.hapag-lloyd.com/en/online-business/track/track-by-booking-solution.html?booking=${encodeURIComponent(bookingNo)}`,
    active: false
  }, (tab) => {
    setTimeout(() => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const radios = document.querySelectorAll('input[type="radio"]');
          if (radios.length > 0) { radios[0].checked = true; radios[0].click(); }
          document.querySelectorAll('button, a, input[type="button"], div[role="button"]').forEach(btn => {
            const txt = (btn.innerText || btn.value || '').toLowerCase();
            if (txt.includes('detail') || txt.includes('تفاصيل')) btn.click();
          });
        }
      }, () => {
        setTimeout(() => {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              let etd = null, eta = null, cutoff = null, vgm = null;
              document.querySelectorAll('tr').forEach(row => {
                const text = row.innerText || '';
                if (/Loading|Vessel\s+departure/i.test(text)) {
                  const match = text.match(/\b\d{4}-\d{2}-\d{2}\b/);
                  if (match && !etd) etd = match[0];
                }
                if (/Discharge|Vessel\s+arrival/i.test(text)) {
                  const match = text.match(/\b\d{4}-\d{2}-\d{2}\b/);
                  if (match) eta = match[0];
                }
              });
              return { etd, eta, cutoff, vgm };
            }
          }, (results) => {
            chrome.tabs.remove(tab.id);
            if (results && results[0] && results[0].result) {
              updateSupabaseDirectly(shipmentId, results[0].result, sendResponse);
            } else {
              sendResponse({ success: false, message: "تعذر قراءة بيانات Hapag" });
            }
          });
        }, 4500);
      });
    }, 4000);
  });
}