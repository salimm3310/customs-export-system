// ==========================================
// 🚢 MSC Carrier Module - Tracker Extension
// ==========================================

async function handleMSC(bookingNo) {
  console.log(`[MSC Engine] 🚀 بدء تتبع شحنة MSC برقم: ${bookingNo}`);

  try {
    // 1. فتح نافذة خلفية/مبوبة لموقع التتبع لشركة MSC
    const mscUrl = `https://www.msc.com/en/track-a-shipment?trackingNumber=${encodeURIComponent(bookingNo)}`;
    
    // إنشاء تبويب صامت لمعالجة الصفحة
    const tab = await chrome.tabs.create({ url: mscUrl, active: false });

    // 2. الانتظار حتى اكتمال تحميل الصفحة
    await new Promise(resolve => setTimeout(resolve, 7000));

    // 3. حقن كود استخراج البيانات داخل الصفحة
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractMSCData
    });

    // إغلاق التبويب بعد الانتهاء
    await chrome.tabs.remove(tab.id);

    if (results && results[0] && results[0].result) {
      const data = results[0].result;

      if (data.success && (data.etd || data.eta || data.cutoff)) {
        console.log("[MSC Engine] ✅ تم استخراج البيانات بنجاح:", data);
        return {
          success: true,
          hasDates: true,
          summary: {
            etd: data.etd || null,
            eta: data.eta || null,
            cutoff: data.cutoff || null
          }
        };
      }
    }

    return {
      success: false,
      hasDates: false,
      message: "لم يتم العثور على تواريخ رسمية مسجلة برقم الحجز داخل موقع MSC."
    };

  } catch (error) {
    console.error("[MSC Engine] ❌ حدث خطأ أثناء قراءة MSC:", error);
    return {
      success: false,
      hasDates: false,
      message: "تعذر قراءة بيانات MSC: " + error.message
    };
  }
}

/**
 * دالة القراءة المستقلة التي تعمل داخل صفحة MSC
 */
function extractMSCData() {
  try {
    let etd = null;
    let eta = null;
    let cutoff = null;

    // استراتيجية 1: البحث في النصوص والجداول عن التواريخ الرئيسية
    const bodyText = document.body.innerText;

    // البحث عن ETD / Shipped / Departure
    const etdMatch = bodyText.match(/(?:ETD|Estimated Time of Departure|Departure|Shipped Date)[:\s]+([\d]{1,2}[\/-][\d]{1,2}[\/-][\d]{2,4}|[A-Za-z]{3}\s+\d{1,2},\s+\d{4})/i);
    if (etdMatch) etd = etdMatch[1];

    // البحث عن ETA / Arrival
    const etaMatch = bodyText.match(/(?:ETA|Estimated Time of Arrival|Arrival)[:\s]+([\d]{1,2}[\/-][\d]{1,2}[\/-][\d]{2,4}|[A-Za-z]{3}\s+\d{1,2},\s+\d{4})/i);
    if (etaMatch) eta = etaMatch[1];

    // البحث عن Cut-off
    const cutoffMatch = bodyText.match(/(?:Cut-off|Doc Cut-off|Port Cut-off)[:\s]+([\d]{1,2}[\/-][\d]{1,2}[\/-][\d]{2,4}|[A-Za-z]{3}\s+\d{1,2},\s+\d{4})/i);
    if (cutoffMatch) cutoff = cutoffMatch[1];

    // استراتيجية 2: البحث داخل عناصر الكروت العامة إن لم تتطابق النصوص
    if (!etd && !eta) {
      const dateElements = Array.from(document.querySelectorAll('span, div, td')).filter(el => {
        return /\b\d{2}[\/\.-]\d{2}[\/\.-]\d{4}\b|\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\b/i.test(el.innerText);
      });

      if (dateElements.length >= 2) {
        etd = etd || dateElements[0].innerText.trim();
        eta = eta || dateElements[dateElements.length - 1].innerText.trim();
      }
    }

    return {
      success: true,
      etd: etd,
      eta: eta,
      cutoff: cutoff
    };

  } catch (err) {
    return { success: false, error: err.message };
  }
}