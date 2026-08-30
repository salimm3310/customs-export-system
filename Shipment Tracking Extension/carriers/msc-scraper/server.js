const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/track-msc', async (req, res) => {
  const bookingNo = req.query.booking;
  console.log(`\n📩 جاري تتبع شحنة MSC برقم: ${bookingNo}`);

  if (!bookingNo) {
    return res.status(400).json({ success: false, message: 'رقم الحجز مطلوب' });
  }

  let browser = null;
  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = (await browser.pages())[0] || await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log('⏳ فتح موقع MSC...');
    await page.goto('https://www.msc.com/en/track-a-shipment', { waitUntil: 'networkidle2', timeout: 90000 });

    try {
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const accept = btns.find(b => (b.innerText || '').toLowerCase().includes('accept'));
        if (accept) accept.click();
      });
    } catch(e) {}

    await new Promise(r => setTimeout(r, 2000));

    console.log('👆 اختيار Booking Number...');
    await page.evaluate(() => {
      function clickDeep(root) {
        const elements = Array.from(root.querySelectorAll('*'));
        for (let el of elements) {
          if (el.shadowRoot) clickDeep(el.shadowRoot);
          if ((el.innerText || '').trim() === 'Booking Number') {
            el.click();
            break;
          }
        }
      }
      clickDeep(document);
    });

    await new Promise(r => setTimeout(r, 2000));

    console.log(`⌨️ إدخال الرقم: ${bookingNo}`);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.type(bookingNo, { delay: 150 });
    
    await new Promise(r => setTimeout(r, 1000));
    await page.keyboard.press('Enter');

    console.log('⏳ الانتظار 14 ثانية لاكتمال تحميل نتائج التتبع...');
    await new Promise(r => setTimeout(r, 14000));

    // قراءة نص الصفحة الكامل من جميع الأجزاء المعزولة
    const fullText = await page.evaluate(() => {
      function getText(root) {
        let str = root.innerText || "";
        const hosts = root.querySelectorAll('*');
        hosts.forEach(h => { if (h.shadowRoot) str += "\n" + getText(h.shadowRoot); });
        return str;
      }
      return getText(document.body);
    });

    console.log('\n--- 📄 بداية نص الصفحة المستخرج ---');
    console.log(fullText.substring(0, 1500)); // طباعة أول 1500 حرف لرؤية التنسيق
    console.log('--- 📄 نهاية نص الصفحة المستخرج ---\n');

    // البحث الشامل عن التواريخ بصيغ متعددة (DD/MM/YYYY أو YYYY-MM-DD أو DD-MMM-YYYY)
    let etd = null, eta = null;

    // التقاط كل التواريخ المكتوبة بالصفحة بالتتابع
    const dateMatches = fullText.match(/\b\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4}\b/g) || [];

    if (dateMatches.length >= 2) {
      etd = dateMatches[0]; // التراخ الأول (غالبًا المغادرة)
      eta = dateMatches[dateMatches.length - 1]; // التاريخ الأخير (غالبًا الوصول)
    } else if (dateMatches.length === 1) {
      eta = dateMatches[0];
    }

    console.log(`📊 التواريخ المستخرجة تلقائياً: ETD = ${etd} | ETA = ${eta}`);

    await browser.close();

    if (etd || eta) {
      return res.json({ success: true, etd, eta });
    } else {
      return res.json({ success: false, message: 'لم يتم العثور على أرقام تواريخ صريحة بالصفحة' });
    }

  } catch (error) {
    console.log(`❌ خطأ: ${error.message}`);
    if (browser) await browser.close();
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000, () => {
  console.log('🚀 MSC Stealth Scraper Server running on http://localhost:3000');
});