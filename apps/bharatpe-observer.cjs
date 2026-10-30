const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const BHARATPE_MERCHANT_ID = process.env.BHARATPE_MERCHANT_ID || '';
const BHARATPE_TOKEN = process.env.BHARATPE_TOKEN || '';
const BHARATPE_COOKIE = process.env.BHARATPE_COOKIE || '';
const YOUPI_API = 'http://localhost:6100';

const seenUtrs = new Set();

async function pollBharatPe() {
  if (!BHARATPE_MERCHANT_ID || !BHARATPE_TOKEN) return;

  try {
    const url = `https://merchant.bharatpe.com/api/v1/merchants/${BHARATPE_MERCHANT_ID}/transactions`;
    const res = await fetch(url, {
      headers: {
        'token': BHARATPE_TOKEN,
        'Cookie': BHARATPE_COOKIE,
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Mobile)'
      }
    });

    const json = await res.json();
    const txns = json?.data?.transactions || json?.transactions || [];

    for (const txn of txns) {
      const utr = txn.bankReferenceNo || txn.utr || txn.payerReferenceNo;
      const amount = parseFloat(txn.amount);
      const status = txn.status || txn.paymentStatus;

      if (utr && !seenUtrs.has(utr) && (status === 'SUCCESS' || status === 'COMPLETED')) {
        seenUtrs.add(utr);
        console.log(`\n[BHARATPE AUTO-VERIFIED] ⚡ Received ₹${amount} | UTR: ${utr}`);

        await fetch(`${YOUPI_API}/api/v1/observers/sms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: 'BHARATPE',
            message: `A/C credited with Rs ${amount.toFixed(2)} via UPI Ref ${utr}`,
            timestamp: Date.now()
          })
        });
      }
    }
  } catch (err) {}
}

console.log('🚀 BharatPe Native Observer Started!');
setInterval(pollBharatPe, 3000);
pollBharatPe();
