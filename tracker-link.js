// ==========================================
// 🚀 توجيه جميع الاستدعاءات للدالة الجديدة
// ==========================================

// تعريف الدالة القديمة لتوجيه الطلب فوراً ومنع الرسالة
function fetchDatesSilently(shipmentId, bookingNo, carrier) {
  triggerTrackerExtension(shipmentId, bookingNo, carrier);
}

function triggerTrackerExtension(shipmentId, bookingNo, carrier) {
  if (!bookingNo || bookingNo === 'N/A') {
    alert("⚠️ رقم الحجز (Booking No) غير صالح أو غير موجود.");
    return;
  }

  const carrierName = carrier || "COSCO";
  console.log(`⏳ [Tracker Link] جاري طلب تتبع [${carrierName}] للحجز: ${bookingNo}...`);

  // إرسال الطلب للـ Content Script
  window.postMessage({
    type: "FROM_PAGE_TRACKER",
    shipmentId: shipmentId,
    bookingNo: bookingNo,
    carrier: carrierName
  }, "*");
}

// الاستماع لرد الإضافة
window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "FROM_EXTENSION_RESPONSE") {
    const response = event.data.response;
    console.log("📥 [Tracker Link] النتيجة:", response);

    if (response && response.success) {
      if (response.hasDates) {
        const etdStr = response.summary.etd || 'غير محدد';
        const etaStr = response.summary.eta || 'غير محدد';
        alert(`✅ تم تحديث التواريخ بنجاح!\n\n📅 ETD: ${etdStr}\n📅 ETA: ${etaStr}`);
        location.reload();
      } else {
        alert("ℹ️ تنبيه: " + (response.message || "لم يتم تسجيل تواريخ مؤكدة."));
      }
    } else {
      alert("❌ تعذر الجلب: " + (response ? response.message : "حدث خطأ أثناء معالجة البيانات."));
    }
  }
});