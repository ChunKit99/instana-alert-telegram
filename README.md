# 🚨 Instana Alert to Telegram

Forward Instana monitoring alerts to Telegram group via Cloudflare Workers webhook.

---

## ✨ Features

- 📊 **Real-time Alerts** - Receive Instana monitoring alerts instantly
- 🔴 **Severity Indicators** - Visual status for Critical/Warning/Info alerts
- 💬 **Telegram Integration** - Send alerts to Telegram group
- 🔗 **Direct Links** - Quick link to view alert in Instana dashboard
- 📝 **Formatted Messages** - Clean, readable alert formatting with HTML
- ⚡ **Serverless** - No server to maintain, runs on Cloudflare Workers

---

## 🛠️ Tech Stack

- **Serverless Platform:** Cloudflare Workers
- **Monitoring Source:** Instana
- **Chat Platform:** Telegram Bot API
- **Language:** JavaScript

---

## 📋 Prerequisites

- Cloudflare account (https://dash.cloudflare.com)
- Telegram account
- Instana account with monitoring setup
- Node.js & npm (for local development)

---

## 🚀 Setup Guide

### Step 1: Get Telegram Credentials

#### 1.1 Create Telegram Bot

1. Open Telegram
2. Search for `@BotFather`
3. Send `/newbot`
4. Follow prompts to create bot
5. **Save Bot Token** (looks like: `123456789:ABCdefGHIjklMNOpqrSTUvwxyzABCD`)

```
TELEGRAM_BOT_TOKEN = 123456789:ABCdefGHIjklMNOpqrSTUvwxyzABCD
```

#### 1.2 Get Group Chat ID

1. Create a Telegram group (or use existing one)
2. Add your bot to the group
3. Search for `@userinfobot` on Telegram
4. Send `/start` in the group (forward message from group)
5. **Get Group Chat ID** (looks like: `-123456789123`)

```
TELEGRAM_GROUP_CHAT_ID = -123456789123
```

---

### Step 2: Create Cloudflare Worker

1. **Go to:** https://dash.cloudflare.com
2. **Left sidebar** → **Workers & Pages** → **Create application** → **Create a Worker**
3. **Name:** `instana-alert-telegram`
4. **Click "Deploy"**

✅ You'll get: `https://instana-alert-telegram.YOUR_ACCOUNT.workers.dev`

---

### Step 3: Set Secrets

```bash
# Set Telegram Bot Token
npx wrangler secret put TELEGRAM_BOT_TOKEN
# Paste: 123456789:ABCdefGHIjklMNOpqrSTUvwxyzABCD

# Set Group Chat ID
npx wrangler secret put TELEGRAM_GROUP_CHAT_ID
# Paste: -123456789123
```

**Verify secrets:**
```bash
npx wrangler secret list
```

---

### Step 4: Deploy Worker

```bash
npx wrangler deploy
```

✅ Worker is live at: `https://instana-alert-telegram.YOUR_ACCOUNT.workers.dev/instana-alert`

---

### Step 5: Configure Instana Webhook

1. **Open Instana Dashboard:** https://instana.io
2. **Settings** → **Webhook Integration**
3. **Add new webhook:**
   - **Name:** `Telegram Alerts`
   - **URL:** `https://instana-alert-telegram.YOUR_ACCOUNT.workers.dev/instana-alert`
   - **Method:** POST
   - **Headers:** None needed
   - **Body:** Default (Instana sends JSON)

4. **Test webhook** → Should appear in Telegram group ✅

---

## 📱 Alert Format Example

```
🔴 Critical
Database Connection Timeout

Entity: Production DB Server
Host: db.example.com
Zone: us-east-1
Time: 14:32:45

Action: Check database connection pool settings...

📊 Open in Instana
```

---

## 🔍 Alert Severity Levels

| Severity | Icon | Status |
|----------|------|--------|
| Critical | 🔴 | Immediate action required |
| Warning | 🟡 | Monitor closely |
| Info | ℹ️ | Informational |
| Resolved | ✅ | Issue closed |

---

## 🧪 Testing Locally

### Test Webhook Manually

```bash
# Start local worker
npx wrangler dev

# In another terminal, send test alert
curl -X POST http://localhost:8787/instana-alert \
  -H "Content-Type: application/json" \
  -d '{
    "issue": {
      "state": "OPEN",
      "severity": 5,
      "text": "High CPU Usage Detected",
      "entityLabel": "api-server-01",
      "fqdn": "api-prod.example.com",
      "zone": "us-east-1",
      "suggestion": "Scale up server resources or optimize application code",
      "link": "https://instana.io/issues/123456"
    }
  }'
```

✅ Message should appear in Telegram group!

---

## 📊 Project Structure

```
instana-alert-telegram/
├── src/
│   └── index.js           # Main worker code
├── wrangler.toml          # Cloudflare config
├── package.json           # Dependencies
├── README.md              # This file
└── .gitignore            # Git ignore
```

---

## 💰 Cost

| Service | Cost |
|---------|------|
| Cloudflare Workers | FREE (100K requests/day) |
| Telegram Bot | FREE |
| Instana | Your existing subscription |
| **Total** | **FREE** ✅ |

---

## 🐛 Troubleshooting

### Issue: Alerts not appearing in Telegram

1. **Check secrets are set:**
   ```bash
   npx wrangler secret list
   ```

2. **Check webhook URL in Instana:**
   - Should be: `https://instana-alert-telegram.YOUR_ACCOUNT.workers.dev/instana-alert`
   - With trailing `/instana-alert`

3. **Check logs:**
   ```bash
   npx wrangler tail
   ```

### Issue: "Chat not found" error

- Verify `TELEGRAM_GROUP_CHAT_ID` is correct
- Make sure bot is in the group
- Chat ID must be negative (like `-123456789`)

### Issue: Wrong alert format

- Check Instana webhook payload
- Verify issue object has required fields
- Check HTML escaping in formatInstanaAlert function

---

## 🔗 Useful Links

- **Cloudflare Workers:** https://workers.cloudflare.com
- **Telegram Bot API:** https://core.telegram.org/bots/api
- **Instana Docs:** https://instana.com/docs
- **Wrangler CLI:** https://developers.cloudflare.com/workers/wrangler

---

## 📝 Notes

- Alerts are formatted with HTML for better readability
- Long suggestions are truncated to 150 characters
- Alert duration is calculated for resolved issues
- All untrusted input is HTML-escaped for security

---

**Happy monitoring! 🚀**