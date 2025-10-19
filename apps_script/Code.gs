/** Apps Script backend for The Weekend Bite orders -> Google Sheets **/
const SHEET_ID   = '1OmzrhMf4LRhXHsWHMjgvMnFQNvuXYMuU8lhXA5_IQvM';
const SHEET_NAME = 'Orders';
const NOTIFY_EMAIL = 'thewkndbitetorino@gmail.com'; // change to your business Gmail
const TZ = 'Europe/Rome';

function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin','*')
    .setHeader('Access-Control-Allow-Methods','POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers','Content-Type');
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    // honeypot protection
    if (data.hp && String(data.hp).trim() !== '') {
      return _json({ ok:false, error:'spam' }, 400);
    }

    const ss = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!ss) throw new Error('Missing sheet "'+SHEET_NAME+'"');

    const ts = new Date();
    const id = 'WB-' + Utilities.formatDate(ts, TZ, 'yyyyMMdd-HHmmss') + '-' +
               Math.floor(Math.random()*1000).toString().padStart(3,'0');

    const items = Array.isArray(data.items) ? data.items : [];
    const total = items.reduce((s, it) => s + (Number(it.price)||0)*(Number(it.qty)||0), 0);

    ss.appendRow([
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

    // Email notification
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

    return _json({ ok: true, id }, 200);
  } catch (err) {
    return _json({ ok:false, error: String(err) }, 400);
  }
}

function _json(obj, code) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin','*')
    .setHeader('Access-Control-Allow-Headers','Content-Type')
    .setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
}
