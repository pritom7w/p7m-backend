const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');
const { createClient } = require('@supabase/supabase-client');
const http = require('http');

// CONNECTION TO YOUR SUPABASE
const supabase = createClient('https://udcxtupppnuhprocloyi.supabase.co', 'sb_publishable_AYjH9uTSTo026yHni97KGA_srQVH-hX');

// KEEP-ALIVE SERVER (For UptimeRobot)
http.createServer((req, res) => { res.writeHead(200); res.end("P7M_ACTIVE"); }).listen(process.env.PORT || 3000);

const accounts = [
  { user: "Suvo.mondalx@gmail.com", pass: "ndpuablwkxolugoe" },
  { user: "sibaroyhdh537@gmail.com", pass: "tbihxrdcsykkfzzg" },
  { user: "Yarkimallis@gmail.com", pass: "xpbwvrbwrctbcway" },
  { user: "shuvomondol02@gmail.com", pass: "dsfqmmibwobikgec" },
  { user: "sarkarsk2023@gmail.com", pass: "pqzivxzfpwbyuigb" },
  { user: "waitandwatch5@gmail.com", pass: "jsvtqnturlufpxrg" },
  { user: "ramitbiswas556@gmail.com", pass: "cgqkjazrkzxpzwzz" },
  { user: "joremioarther@gmail.com", pass: "pqmfnigtuitxwynl" },
  { user: "tourtonainital31102024@gmail.com", pass: "hnedsnwthiuwrlvh" },
  { user: "ashishbiswas881@gmail.com", pass: "mqmjahzflbidsnwv" }
];

async function startMonitor(acc) {
  try {
    const connection = await imaps.connect({
      imap: { user: acc.user, password: acc.pass, host: 'imap.gmail.com', port: 993, tls: true, authTimeout: 10000 }
    });
    await connection.openBox('INBOX');
    console.log(`CONNECTED: ${acc.user}`);

    connection.on('mail', async () => {
      const messages = await connection.search(['UNSEEN'], { bodies: [''], markSeen: true });
      for (let item of messages) {
        const part = item.parts.find(p => p.which === '');
        const mail = await simpleParser(part.body);
        
        await supabase.from('delivery_logs').insert([{
          target_email: acc.user,
          sender: mail.from?.value[0]?.address || "Unknown",
          subject: mail.subject || "No Subject",
          spf_status: mail.headers.get('received-spf')?.includes('pass') ? 'PASS' : 'FAIL',
          dkim_status: mail.headers.get('dkim-signature') ? 'PASS' : 'FAIL',
          priority: mail.headers.get('x-priority') || 'NORMAL'
        }]);
      }
    });

    connection.on('error', () => setTimeout(() => startMonitor(acc), 5000));
  } catch (e) { setTimeout(() => startMonitor(acc), 10000); }
}

accounts.forEach(startMonitor);
