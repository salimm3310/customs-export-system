importScripts(
  'carriers/hapag.js',
  'carriers/maersk.js',
  'carriers/cosco.js',
  'carriers/msc.js'
);

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  if (request.action === "FETCH_SILENTLY") {
    const bookingNo = request.bookingNo;
    const shipmentId = request.shipmentId;
    const carrier = request.carrier || "Hapag-Lloyd";

    // التوجيه الفردي بناءً على نوع الخط الملاحي
    switch (carrier) {
      case "Hapag-Lloyd":
        processHapag(shipmentId, bookingNo, sendResponse, updateSupabaseDirectly);
        break;
      case "Maersk":
        processMaersk(shipmentId, bookingNo, sendResponse, updateSupabaseDirectly);
        break;
      case "COSCO":
        processCosco(shipmentId, bookingNo, sendResponse, updateSupabaseDirectly);
        break;
      case "MSC":
        processMsc(shipmentId, bookingNo, sendResponse, updateSupabaseDirectly);
        break;
      default:
        processHapag(shipmentId, bookingNo, sendResponse, updateSupabaseDirectly);
        break;
    }

    return true; // Asynchronous Response
  }
});

// دالة التحديث الموحدة لقاعدة البيانات Supabase
function updateSupabaseDirectly(shipmentId, dates, sendResponse) {
  const parseDate = (dStr) => {
    if (!dStr) return null;
    const months = { jan:'01', feb:'02', mar:'03', apr:'04', may:'05', jun:'06', jul:'07', aug:'08', sep:'09', oct:'10', nov:'11', dec:'12' };
    
    if (dStr.includes('T')) return dStr.split('T')[0];

    const alphaMatch = dStr.match(/(\d{1,2})[\s-]([A-Za-z]{3})[a-z]*[\s-](202[4-9])/i);
    if (alphaMatch) {
      const day = alphaMatch[1].padStart(2, '0');
      const month = months[alphaMatch[2].toLowerCase()];
      const year = alphaMatch[3];
      return `${year}-${month}-${day}`;
    }

    const p = dStr.split(/[\/\.-]/);
    if (p.length === 3) {
      if (p[0].length <= 2 && p[2].length === 4) {
        return `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`;
      }
      if (p[0].length === 4) return `${p[0]}-${p[1].padStart(2,'0')}-${p[2].padStart(2,'0')}`;
    }
    return dStr;
  };

  let parsedETD = parseDate(dates.etd);
  let parsedETA = parseDate(dates.eta);
  let parsedCutoff = parseDate(dates.cutoff);
  let parsedVGM = parseDate(dates.vgm);

  if (!parsedETD && parsedETA) parsedETA = null;
  if (parsedETD && parsedETA && new Date(parsedETA) < new Date(parsedETD)) parsedETA = null;

  const hasAnyDate = parsedETD || parsedETA || parsedCutoff || parsedVGM;

  if (!hasAnyDate) {
    return sendResponse({ 
      success: true, 
      hasDates: false,
      message: "لم يتم تسجيل تواريخ مؤكدة"
    });
  }

  fetch("https://yoxggtyqsjrwcjpjbiuo.supabase.co/rest/v1/shipments?id=eq." + shipmentId, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "apikey": "sb_publishable_OPgRgcwJYDR3Zd5UReo5dw_MmTjlnlg",
      "Authorization": "Bearer sb_publishable_OPgRgcwJYDR3Zd5UReo5dw_MmTjlnlg",
      "Prefer": "return=representation"
    },
    body: JSON.stringify({
      etd_date: parsedETD,
      eta_date: parsedETA,
      cutoff_date: parsedCutoff,
      vgm_date: parsedVGM
    })
  })
  .then(res => res.json())
  .then(data => {
    sendResponse({ 
      success: true, 
      hasDates: true,
      data,
      summary: { etd: parsedETD, eta: parsedETA, cutoff: parsedCutoff, vgm: parsedVGM }
    });
  })
  .catch(err => sendResponse({ success: false, error: err.message }));
}