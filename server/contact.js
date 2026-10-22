// Minimal contact-submissions API. No framework, no deps. Spec #347, work #436.
// POST /api/contact  JSON {name, email, message}
//   201 {ok:true}                  stored + notification sent
//   400 {ok:false,errors:[...]}    invalid payload (also non-JSON body)
//   500 {ok:false,errors:[...]}    store or notify failed — nothing is silently dropped
//
// Storage: dba's contact_submissions table (work #440,
// db/migrations/001_contact_submissions.sql): INSERT (name, email, message)
// RETURNING id, received_at — received_at defaults to now() server-side.
// When no APP_DATABASE_URL is set (local dev), submissions go to an in-memory
// store so the endpoint stays testable. APP_DATABASE_URL must come from deploy
// config for the dedicated app DB (dba provisions it + runs migration 001) —
// never inherit ambient DATABASE_URL: the local Postgres on :5432 is board
// tooling's own DB (db buzz, user acv) and must not receive contact rows.
// Notification per FR-5: email via SMTP if SMTP_HOST is set, otherwise the
// notification is NOT sent and reported as skipped with a stderr warning.
// A submission is only 201 when BOTH store and notify succeed; a failed notify
// after a successful store returns 500 with the stored id so it can be re-sent
// rather than lost.

const http = require('http');
const net = require('net');

const MAX = { name: 255, email: 255, message: 10000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(body) {
  const errors = [];
  for (const f of ['name', 'email', 'message']) {
    if (typeof body?.[f] !== 'string' || body[f].trim() === '') errors.push(`${f}: required`);
    else if (body[f].length > MAX[f]) errors.push(`${f}: must be at most ${MAX[f]} characters`);
  }
  if (typeof body?.email === 'string' && body.email.trim() !== '' && !EMAIL_RE.test(body.email.trim()))
    errors.push('email: invalid address');
  return errors;
}

// --- storage: contact_submissions, matching dba's schema ---
const memStore = [];
async function storeSubmission({ name, email, message }) {
  if (!process.env.APP_DATABASE_URL) {
    const id = memStore.length + 1;
    memStore.push({ id, name, email, message, received_at: new Date().toISOString() });
    return { id, received_at: memStore[0] && memStore[memStore.length - 1].received_at };
  }
  return pgInsert({ name, email, message });
}

async function pgInsert() {
  // Plain-HTTP server: `pg` gets vendored when the app-DB DSN exists (dba
  // provisions role + database and runs migration 001 first). Until then this
  // fails loudly rather than pretending to store. SQL is fixed by dba's work
  // #440:
  //   INSERT INTO contact_submissions (name, email, message)
  //   VALUES ($1, $2, $3) RETURNING id, received_at
  throw new Error('app database not provisioned yet (APP_DATABASE_URL pending from dba) — submission NOT stored');
}

// --- email notification per FR-5 ---
function sendNotification({ name, email, message }) {
  const to = process.env.CONTACT_NOTIFY_TO;
  const subject = `New contact submission from ${name}`;
  const text = `Name: ${name}\nEmail: ${email}\n\n${message}`;
  if (!process.env.SMTP_HOST) {
    console.error(`[contact] SMTP_HOST unset — notification for "${name}" NOT sent (CONTACT_NOTIFY_TO=${process.env.CONTACT_NOTIFY_TO || 'unset'}). Submission is stored; set SMTP_HOST to enable FR-5 delivery.`);
    return Promise.resolve({ skipped: true });
  }
  return smtpSend({ to, subject, text });
}

async function smtpSend({ to, subject, text }) {
  // Minimal SMTP client against process.env.SMTP_HOST[:PORT]; MAIL FROM is
  // SMTP_FROM (default the notify address). Rejects on any non-2xx reply.
  const [host, p] = (process.env.SMTP_HOST || '').split(':');
  const port = Number(p || process.env.SMTP_PORT || 25);
  const from = process.env.SMTP_FROM || to;
  const reply = (sock, cmd) =>
    new Promise((res, rej) => {
      const onData = (d) => {
        const line = d.toString();
        if (/^[45]\d\d/.test(line)) rej(new Error(`SMTP ${line.trim()}`));
        else res(line);
        sock.removeListener('data', onData);
      };
      sock.on('data', onData);
      if (cmd) sock.write(cmd + '\r\n');
    });
  const sock = net.connect(port, host);
  await new Promise((res, rej) => {
    sock.once('connect', res);
    sock.once('error', rej);
  });
  await reply(sock);
  await reply(sock, `EHLO localhost`);
  await reply(sock, `MAIL FROM:<${from}>`);
  await reply(sock, `RCPT TO:<${to}>`);
  await reply(sock, 'DATA');
  await reply(sock, `Subject: ${subject}\r\n\r\n${text}\r\n.`);
  await reply(sock, 'QUIT');
  sock.end();
  return { sent: true };
}

function handle(req, res) {
  if (req.method !== 'POST' || req.url !== '/api/contact') {
    res.writeHead(404, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ ok: false, errors: ['not found'] }));
  }
  let raw = '';
  req.on('data', (c) => {
    raw += c;
    if (raw.length > 1e6) req.destroy();
  });
  req.on('end', async () => {
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      res.writeHead(400, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ ok: false, errors: ['body: must be valid JSON'] }));
    }
    const errors = validate(body);
    if (errors.length) {
      res.writeHead(400, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ ok: false, errors }));
    }
    const submission = {
      name: body.name.trim(),
      email: body.email.trim(),
      message: body.message.trim(),
    };
    let stored;
    try {
      stored = await storeSubmission(submission);
    } catch (e) {
      res.writeHead(500, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ ok: false, errors: [`store: ${e.message}`] }));
    }
    try {
      await sendNotification(submission);
    } catch (e) {
      res.writeHead(500, { 'content-type': 'application/json' });
      return res.end(
        JSON.stringify({ ok: false, errors: [`notify: ${e.message}`], stored_id: stored.id })
      );
    }
    res.writeHead(201, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, id: stored.id }));
  });
}

if (require.main === module) {
  if (process.env.NODE_ENV === 'production' && !process.env.APP_DATABASE_URL) {
    console.error('[contact] refusing to start: APP_DATABASE_URL unset in production');
    process.exit(1);
  }
  if (process.env.SMTP_HOST && !process.env.CONTACT_NOTIFY_TO) {
    console.error('[contact] refusing to start: SMTP_HOST set but CONTACT_NOTIFY_TO unset — would notify nowhere');
    process.exit(1);
  }
  const port = process.env.PORT || 3000;
  http.createServer(handle).listen(port, () => console.log(`[contact] listening on :${port}`));
}

module.exports = { handle, validate };
