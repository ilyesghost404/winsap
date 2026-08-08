const Imap = require("imap");
const { simpleParser } = require("mailparser");

/**
 * Create an IMAP connection using environment config.
 */
function createImapConnection() {
  const host = process.env.IMAP_HOST || "imap.gmail.com";
  const port = parseInt(process.env.IMAP_PORT || "993", 10);
  const user = process.env.IMAP_USER || process.env.EMAIL_USER;
  const password = process.env.IMAP_PASSWORD || process.env.EMAIL_PASSWORD;

  if (!user || !password) {
    throw new Error("IMAP credentials not configured (IMAP_USER / IMAP_PASSWORD)");
  }

  return new Imap({
    user,
    password,
    host,
    port,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
    authTimeout: 10000,
    connTimeout: 15000
  });
}

/**
 * Fetch all UNSEEN emails from the configured mailbox.
 * Returns an array of parsed email objects.
 *
 * @returns {Promise<Array<{messageId: string, from: string, fromName: string, subject: string, textBody: string, htmlBody: string, date: Date}>>}
 */
function fetchUnreadEmails() {
  const mailbox = process.env.IMAP_MAILBOX || "INBOX";

  return new Promise((resolve, reject) => {
    const imap = createImapConnection();
    const emails = [];

    imap.once("ready", () => {
      imap.openBox(mailbox, false, (err, box) => {
        if (err) {
          imap.end();
          return reject(new Error(`Failed to open mailbox "${mailbox}": ${err.message}`));
        }

        imap.search(["UNSEEN"], (err, uids) => {
          if (err) {
            imap.end();
            return reject(new Error(`IMAP search failed: ${err.message}`));
          }

          if (!uids || uids.length === 0) {
            console.log("📬 No unread emails found.");
            imap.end();
            return resolve([]);
          }

          console.log(`📬 Found ${uids.length} unread email(s). Fetching...`);

          const fetch = imap.fetch(uids, {
            bodies: "",
            markSeen: true,
            struct: true
          });

          fetch.on("message", (msg, seqno) => {
            let rawData = "";

            msg.on("body", (stream) => {
              stream.on("data", (chunk) => {
                rawData += chunk.toString("utf8");
              });
            });

            msg.once("end", () => {
              // Parse each email after receiving its full body
              simpleParser(rawData)
                .then((parsed) => {
                  const from = parsed.from?.value?.[0] || {};
                  emails.push({
                    messageId: parsed.messageId || `no-id-${Date.now()}-${seqno}`,
                    from: from.address || "unknown",
                    fromName: from.name || "",
                    subject: parsed.subject || "(No Subject)",
                    textBody: parsed.text || "",
                    htmlBody: parsed.html || "",
                    date: parsed.date || new Date()
                  });
                })
                .catch((parseErr) => {
                  console.error(`⚠️ Failed to parse email #${seqno}:`, parseErr.message);
                });
            });
          });

          fetch.once("error", (fetchErr) => {
            console.error("IMAP fetch error:", fetchErr.message);
            imap.end();
            reject(fetchErr);
          });

          fetch.once("end", () => {
            // Small delay to let all simpleParser promises finish
            setTimeout(() => {
              imap.end();
              resolve(emails);
            }, 500);
          });
        });
      });
    });

    imap.once("error", (err) => {
      console.error("IMAP connection error:", err.message);
      reject(new Error(`IMAP connection error: ${err.message}`));
    });

    imap.once("end", () => {
      console.log("📪 IMAP connection closed.");
    });

    imap.connect();
  });
}

/**
 * Check if email reader is properly configured.
 */
function isConfigured() {
  const user = process.env.IMAP_USER || process.env.EMAIL_USER;
  const password = process.env.IMAP_PASSWORD || process.env.EMAIL_PASSWORD;
  return Boolean(user && password);
}

module.exports = {
  fetchUnreadEmails,
  isConfigured
};
