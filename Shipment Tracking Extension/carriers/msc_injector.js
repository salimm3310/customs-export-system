// ==========================================
// 🚢 Live MSC Auto-Search & Extractor Engine
// ==========================================

async function autoSearchAndExtract() {
  // 1. استخراج رقم الحجز من رابط الصفحة URL
  const urlParams = new URLSearchParams(window.location.search);
  const bookingNo = urlParams.get('number');

  // 2. تعبئة الرقم والبحث تلقائياً إذا كان المربع فارغاً
  const searchInput = document.querySelector('input[name="TrackingNumber"], input[type="text"], #tracking-number');
  if (searchInput && bookingNo && !searchInput.value) {
    searchInput.value = bookingNo;
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    searchInput.dispatchEvent(new Event('change', { bubbles: true }));

    // البحث عن زر Search والنقر عليه
    const searchBtn = document.querySelector('button[type="submit"], .msc-single-track__btn, button.btn-primary');
    if (searchBtn) {
      searchBtn.click();
    }
  }

  // 3. استخراج التواريخ فور اكتمال ظهور النتيجة
  const text = document.body.innerText || "";
  
  const etdMatch = text.match(/Estimated Time of Departure[\s\S]*?(\d{2}\/\d{2}\/\d{4})/i);
  const etaMatch = text.match(/(?:Estimated Time of Arrival|POD ETA)[\s\S]*?(\d{2}\/\d{2}\/\d{4})/i);
  const dates = text.match(/\d{2}\/\d{2}\/\d{4}/g) || [];

  const etd = etdMatch ? etdMatch[1] : null;
  const eta = etaMatch ? etaMatch[1] : (dates[0] || null);

  // إذا تم العثور على التواريخ، أرسل البيانات وأغلق التبويب تلقائياً
  if (etd || eta) {
    const payload = {
      type: "MSC_DATES_CAPTURED",
      summary: { etd: etd || "غير محدد", eta: eta || "غير محدد" }
    };

    if (window.opener) {
      window.opener.postMessage(payload, "*");
      setTimeout(() => window.close(), 1500); // إغلاق التبويب آلياً بعد ثانية ونصف
    }
  }
}

// تشغيل الفحص والبحث بمرونة كل ثانية
setInterval(autoSearchAndExtract, 1500);