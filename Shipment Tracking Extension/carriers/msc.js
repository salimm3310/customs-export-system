// ==========================================
// 🚢 MSC Scraper Engine - Updated
// ==========================================

async function handleMSC(bookingNo) {
  try {
    const trackingUrl = `https://www.msc.com/en/track-a-shipment?number=${bookingNo}`;
    const response = await fetch(trackingUrl);
    const htmlText = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");

    let etd = null;
    let eta = null;

    // 1. البحث في جدولة الأحداث (Events Timeline)
    const rows = doc.querySelectorAll('tr, div, li');
    rows.forEach(row => {
      const text = row.textContent || "";
      
      if (text.includes("Estimated Time of Departure") && !etd) {
        const dateMatch = text.match(/\d{2}\/\d{2}\/\d{4}/);
        if (dateMatch) etd = dateMatch[0];
      }

      if ((text.includes("Estimated Time of Arrival") || text.includes("POD ETA")) && !eta) {
        const dateMatch = text.match(/\d{2}\/\d{2}\/\d{4}/);
        if (dateMatch) eta = dateMatch[0];
      }
    });

    // 2. التحقق وإرجاع النتيجة
    if (etd || eta) {
      return {
        success: true,
        hasDates: true,
        summary: {
          etd: etd || 'غير محدد',
          eta: eta || 'غير محدد'
        }
      };
    } else {
      return {
        success: false,
        message: "لم يتم العثور على التواريخ داخل الهيكل الجديد لصفحة MSC."
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "خطأ أثناء معالجة استجابة MSC: " + error.message
    };
  }
}