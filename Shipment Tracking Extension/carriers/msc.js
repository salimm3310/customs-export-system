// ==========================================
// 🚢 MSC Scraper Engine - Direct API Integration
// ==========================================

async function handleMSC(bookingNo) {
  try {
    // 1. رابط الـ API المباشر لـ MSC لجلب بيانات التتبع بصيغة JSON
    const apiUrl = `https://www.msc.com/api/feature/tracking/search?query=${bookingNo}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      // إذا فشل الـ API، نستخدم الحل البديل من واجهة الصفحة مباشرة
      return await handleMSCAlternative(bookingNo);
    }

    const data = await response.json();
    let etd = null;
    let eta = null;

    // 2. تحليل كائن البيانات الوارد من MSC
    if (data && data.data && data.data.containers) {
      for (const container of data.data.containers) {
        if (container.events && container.events.length > 0) {
          for (const ev of container.events) {
            const desc = (ev.description || '').toLowerCase();
            if (desc.includes('departure') && !etd) {
              etd = formatDate(ev.date);
            }
            if ((desc.includes('arrival') || desc.includes('pod')) && !eta) {
              eta = formatDate(ev.date);
            }
          }
        }
        if (container.podEta && !eta) {
          eta = formatDate(container.podEta);
        }
      }
    }

    if (etd || eta) {
      return {
        success: true,
        hasDates: true,
        summary: { etd: etd || 'غير محدد', eta: eta || 'غير محدد' }
      };
    }

    // تجربة الحل البديل في حال لم ترجع بيانات عبر الـ API
    return await handleMSCAlternative(bookingNo);

  } catch (error) {
    return await handleMSCAlternative(bookingNo);
  }
}

// دالة مساعدة لتنسيق التاريخ إلى DD/MM/YYYY
function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// دالة بديلة للجلب من الصفحة المباشرة
async function handleMSCAlternative(bookingNo) {
  try {
    const trackingUrl = `https://www.msc.com/en/track-a-shipment?number=${bookingNo}`;
    const res = await fetch(trackingUrl);
    const html = await res.text();

    // البحث عن التواريخ بأسلوب النمط الموسع
    const dates = html.match(/\d{2}\/\d{2}\/\d{4}/g);
    
    if (dates && dates.length >= 2) {
      return {
        success: true,
        hasDates: true,
        summary: { etd: dates[0], eta: dates[1] }
      };
    } else if (dates && dates.length === 1) {
      return {
        success: true,
        hasDates: true,
        summary: { etd: 'غير محدد', eta: dates[0] }
      };
    }

    return {
      success: false,
      message: "لم نتمكن من التقاط التواريخ تلقائياً من نظام MSC."
    };
  } catch (err) {
    return { success: false, message: "تعذر الاتصال بخادم MSC: " + err.message };
  }
}