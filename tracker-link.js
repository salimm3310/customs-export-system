// ==========================================
// 🚀 ملف ربط برنامج التتبع بإضافة Tracker
// ==========================================

// المعرّف الخاص بإضافة Tracker في متصفح كروم
const TRACKER_EXTENSION_ID = "fnbglnnolemmndfjglfjkkapddfeladc";

/**
 * الدالة الرئيسية لطلب التتبع الآلي للخطوط الملاحية عبر إضافة Tracker
 * @param {string|number} shipmentId - معرف الشحنة في Supabase
 * @param {string} bookingNo - رقم الحجز (Booking Number)
 * @param {string} carrier - اسم الخط الملاحي (MSC / Maersk / COSCO / Hapag-Lloyd)
 */
function triggerTrackerExtension(shipmentId, bookingNo, carrier) {
  // 1. التحقق من وجود متصفح Chrome والإضافة
  if (typeof chrome === "undefined" || !chrome.runtime || !chrome.runtime.sendMessage) {
    alert("⚠️ التتبع الآلي يتطلب استخدام متصفح Google Chrome وتثبيت إضافة Tracker.");
    return;
  }

  // 2. التحقق من توفر بيانات الشحنة
  if (!bookingNo || !carrier) {
    alert("⚠️ يرجى التأكد من توفر رقم الحجز واسم الخط الملاحي للشحنة.");
    return;
  }

  console.log(`⏳ جاري إرسال طلب التتبع [${carrier}] برقم الحجز: ${bookingNo}...`);

  // 3. إرسال الطلب إلى الإضافة
  chrome.runtime.sendMessage(
    TRACKER_EXTENSION_ID,
    {
      action: "FETCH_SILENTLY",
      shipmentId: shipmentId,
      bookingNo: bookingNo,
      carrier: carrier
    },
    (response) => {
      // التعامل مع خطأ عدم الوصول للإضافة
      if (chrome.runtime.lastError) {
        console.error("❌ خطأ في الاتصال بالإضافة:", chrome.runtime.lastError.message);
        alert("تعذر الاتصال بإضافة Tracker.\nتأكد من تفعيل الإضافة وتحديث الصفحة.");
        return;
      }

      // 4. معالجة النتيجة وإظهار التنبيه
      if (response && response.success) {
        if (response.hasDates) {
          const etdStr = response.summary.etd ? response.summary.etd : 'غير محدد';
          const etaStr = response.summary.eta ? response.summary.eta : 'غير محدد';
          
          alert(`✅ تم تحديث التواريخ بنجاح!\n\n📅 تاريخ المغادرة (ETD): ${etdStr}\n📅 تاريخ الوصول (ETA): ${etaStr}`);

          // إعادة تحميل البيانات تلقائياً في الجدول
          if (typeof loadShipments === "function") {
            loadShipments();
          } else if (typeof fetchShipments === "function") {
            fetchShipments();
          } else {
            location.reload();
          }
        } else {
          alert("ℹ️ تنبيه: " + (response.message || "لم يتم تسجيل تواريخ مؤكدة لشحنة هذا الخط."));
        }
      } else {
        alert("❌ فشل عملية الجلب: " + (response ? response.message : "حدث خطأ أثناء السحب."));
      }
    }
  );
}