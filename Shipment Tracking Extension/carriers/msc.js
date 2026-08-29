// ==========================================
// 🚢 MSC Scraper Engine - Service Worker Compatible
// ==========================================

async function handleMSC(bookingNo) {
  try {
    const trackingUrl = `https://www.msc.com/en/track-a-shipment?number=${bookingNo}`;
    
    // 1. جلب محتوى HTML الخاص بموقع MSC
    const response = await fetch(trackingUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const htmlText = await response.text();

    let etd = null;
    let eta = null;

    // 2. استخراج التواريخ باستخدام Regex المباشر لضمان التوافق مع Service Worker
    // البحث عن تاريخ المغادرة (Departure)
    const etdMatch = htmlText.match(/Estimated Time of Departure[\s\S]*?(\d{2}\/\d{2}\/\d{4})/i);
    if (etdMatch && etdMatch[1]) {
      etd = etdMatch[1];
    }

    // البحث عن تاريخ الوصول (Arrival / POD ETA)
    const etaMatch = htmlText.match(/(?:Estimated Time of Arrival|POD ETA)[\s\S]*?(\d{2}\/\d{2}\/\d{4})/i);
    if (etaMatch && etaMatch[1]) {
      eta = etaMatch[1];
    }

    // 3. التحقق وإرجاع النتيجة
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
        message: "لم يتم العثور على صيغ التواريخ في استجابة MSC."
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "خطأ أثناء معالجة استجابة MSC: " + error.message
    };
  }
}