/** Apps Script backend for The Weekend Bite orders -> Google Sheets **/
const SHEET_ID     = '13iM3dEuCnodgjFRoQcSGfBEDFmepRjoJRBRpQR7tmLk'; // your sheet
const SHEET_NAME   = 'Orders';                                         // tab name
const NOTIFY_EMAIL = 'ibrahimnasser339@gmail.com';                     // your Gmail
const TZ = 'Europe/Rome';

/** Simple GET so you can open the /exec URL in a browser to test */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, ping: 'TheWeekendBite', time: new Date() }))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Receive orders from the website (POST) */
function doPost(e) {
  try {
    const raw  = (e && e.postData) ? e.postData.contents : '{}';   // we post text/plain from the site
    const data = JSON.parse(raw || '{}');

    // Honeypot anti-spam: hidden field must be empty
    if (data.hp && String(data.hp).trim() !== '') {
      return json({ ok:false, error:'spam' }, 400);
    }

    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Missing sheet "' + SHEET_NAME + '"');

    const ts = new Date();
    const id = 'WB-' + Utilities.formatDate(ts, TZ, 'yyyyMMdd-HHmmss') + '-' +
               Math.floor(Math.random()*1000).toString().padStart(3,'0');

    const items = Array.isArray(data.items) ? data.items : [];
    const total = items.reduce((s, it) => s + (Number(it.price)||0) * (Number(it.qty)||0), 0);

    sheet.appendRow([
      Utilities.formatDate(ts, TZ, 'yyyy-MM-dd HH:mm:ss'),
      id,
      data.name || '',
      data.phone || '',
      data.address || '',
      JSON.stringify(items),
      Number(total.toFixed(2)),
      data.notes || '',
      data.lang || '',
      data.ua || ''
    ]);

    // Email summary
    const summary = items.map(it => `- ${it.name} — ${it.qty} kg @ €${it.price}/kg`).join('\n');
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: `New Order: ${id} (€${total.toFixed(2)})`,
      htmlBody: `
        <b>${id}</b><br>
        <b>Name:</b> ${data.name}<br>
        <b>Phone:</b> ${data.phone}<br>
        <b>Address:</b> ${data.address}<br>
        <b>Notes:</b> ${data.notes||''}<br>
        <pre>${summary}</pre>
        <b>Estimated Total:</b> €${total.toFixed(2)}
      `
    });

    return json({ ok:true, id }, 200);
  } catch (err) {
    return json({ ok:false, error:String(err) }, 400);
  }
}

/** Minimal JSON response helper */
function json(obj, code) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
