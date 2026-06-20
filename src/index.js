/**
 * Cloudflare Worker: Instana Alert to Telegram Webhook
 * 
 * Receives alerts from Instana monitoring and forwards them to Telegram group
 * 
 * Environment Variables Required:
 * - TELEGRAM_BOT_TOKEN: Your Telegram bot token
 * - TELEGRAM_GROUP_CHAT_ID: Target group chat ID
 */

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const pathname = url.pathname;

        if (pathname === '/instana-alert' && request.method === 'POST') {
            return handleInstanaAlert(request, env);
        }

        return new Response(
            JSON.stringify({ error: 'Endpoint not found' }),
            { 
                status: 404, 
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
};

/**
 * Send message to Telegram group
 */
async function sendTelegramMessage(env, message) {
    try {
        const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: env.TELEGRAM_GROUP_CHAT_ID,
                text: message,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Telegram API Error: ${response.status}`, errorText);
            return false;
        }

        return true;

    } catch (error) {
        console.error('Error sending Telegram message:', error);
        return false;
    }
}

/**
 * Format Instana alert for Telegram
 */
function formatInstanaAlert(data) {
    const issue = data.issue || {};
    
    const state = issue.state || 'Unknown';
    const severity = issue.severity || 0;
    const text = issue.text || 'No description';
    const suggestion = issue.suggestion || '';
    const link = issue.link || '';
    
    const entityLabel = issue.entityLabel || '';
    const fqdn = issue.fqdn || '';
    const zone = issue.zone || '';
    const container = issue.container || '';
    
    const startTime = issue.start;
    const timestamp = startTime 
        ? new Date(startTime).toLocaleTimeString()
        : 'Unknown';
    
    let statusText = 'ℹ️ Info';
    if (state === 'CLOSED') statusText = '✅ Resolved';
    else if (severity === 5) statusText = '🔴 Critical';
    else if (severity >= 3) statusText = '🟡 Warning';

    const safe = (value) => escapeHtml(String(value));
    
    let message = `<b>${safe(statusText)}</b>\n`;
    message += `<b>${safe(text)}</b>\n\n`;
    
    if (entityLabel) message += `<b>Entity:</b> ${safe(entityLabel)}\n`;
    if (fqdn) message += `<b>Host:</b> ${safe(fqdn)}\n`;
    if (zone) message += `<b>Zone:</b> ${safe(zone)}\n`;
    if (container) message += `<b>Container:</b> ${safe(container)}\n`;
    
    message += `<b>Time:</b> ${safe(timestamp)}\n`;
    
    if (suggestion && state !== 'CLOSED') {
        const shortSuggestion = suggestion.length > 150 
            ? suggestion.substring(0, 150) + '...'
            : suggestion;
        message += `<b>Action:</b> ${safe(shortSuggestion)}\n`;
    }
    
    if (state === 'CLOSED' && issue.start && issue.end) {
        const duration = (issue.end - issue.start) / 1000 / 60;
        message += `<b>Duration:</b> ${duration.toFixed(1)} min\n`;
    }
    
    if (link) {
        message += `\n<a href="${safe(link)}">📊 Open in Instana</a>`;
    }
    
    return message;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * POST /instana-alert - Handle Instana webhook
 */
async function handleInstanaAlert(request, env) {
    try {
        const data = await request.json();
        
        if (!data) {
            return new Response(
                JSON.stringify({ error: 'No JSON data received' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }
        
        const formattedMessage = formatInstanaAlert(data);
        const success = await sendTelegramMessage(env, formattedMessage);
        
        return new Response(
            JSON.stringify({
                status: success ? 'success' : 'error',
                message: success ? 'Alert sent' : 'Failed to send alert'
            }),
            { 
                status: success ? 200 : 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
        
    } catch (error) {
        console.error('Error processing webhook:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}