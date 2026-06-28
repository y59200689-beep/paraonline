export function cleanPhoneNumber(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/\s+/g, '').replace(/[+\-()]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '212' + cleaned.substring(1);
  }
  if (!cleaned.startsWith('212') && cleaned.length === 9) {
    cleaned = '212' + cleaned;
  }
  return cleaned;
}

export function interpolateTemplate(template: string, variables: Record<string, string>): string {
  if (!template) return '';
  return template.replace(/\{([^{}]+)\}/g, (match, key) => {
    const val = variables[key];
    return val !== undefined && val !== null ? String(val) : '';
  });
}

export interface WhatsAppSendResult {
  success: boolean;
  mode: 'twilio' | 'cloud_api' | 'direct_link';
  messageId?: string;
  status?: string;
  url?: string;
  warning?: string;
  error?: string;
}

export async function sendWhatsAppMessage(
  phone: string,
  message: string,
  settings: any
): Promise<WhatsAppSendResult> {
  const formattedPhone = cleanPhoneNumber(phone);
  const encodedMsg = encodeURIComponent(message);
  const directLinkUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMsg}`;
  
  const provider = settings.whatsappProvider || 'direct_link';

  if (provider === 'twilio') {
    const sid = settings.twilioAccountSid;
    const token = settings.twilioAuthToken;
    const from = settings.twilioFromNumber;

    if (sid && token && from) {
      try {
        const authString = Buffer.from(`${sid}:${token}`).toString('base64');
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
        
        const params = new URLSearchParams();
        params.append('To', `whatsapp:+${formattedPhone}`);
        params.append('From', `whatsapp:${from.startsWith('+') ? from : '+' + from}`);
        params.append('Body', message);

        const res = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        });

        const resData = await res.json();
        if (res.ok && resData.sid) {
          return {
            success: true,
            mode: 'twilio',
            messageId: resData.sid,
            status: resData.status
          };
        } else {
          console.error("Twilio API failed:", resData);
          return {
            success: true,
            mode: 'direct_link',
            url: directLinkUrl,
            warning: `Twilio API failed: ${resData.message || 'Unknown error'}. Redirection manuelle requise.`
          };
        }
      } catch (e: any) {
        console.error("Twilio request error:", e);
        return {
          success: true,
          mode: 'direct_link',
          url: directLinkUrl,
          warning: `Erreur de connexion Twilio: ${e.message}. Redirection manuelle requise.`
        };
      }
    }
  } else if (provider === 'cloud_api') {
    const token = settings.whatsappCloudAccessToken;
    const phoneId = settings.whatsappCloudPhoneNumberId;

    if (token && phoneId) {
      try {
        const cloudApiUrl = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
        const res = await fetch(cloudApiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: `+${formattedPhone}`,
            type: 'text',
            text: {
              body: message
            }
          })
        });

        const resData = await res.json();
        if (res.ok && resData.messages && resData.messages[0]) {
          return {
            success: true,
            mode: 'cloud_api',
            messageId: resData.messages[0].id
          };
        } else {
          console.error("WhatsApp Cloud API failed:", resData);
          return {
            success: true,
            mode: 'direct_link',
            url: directLinkUrl,
            warning: `Cloud API failed: ${resData.error?.message || 'Unknown error'}. Redirection manuelle requise.`
          };
        }
      } catch (e: any) {
        console.error("WhatsApp Cloud API request error:", e);
        return {
          success: true,
          mode: 'direct_link',
          url: directLinkUrl,
          warning: `Erreur de connexion Cloud API: ${e.message}. Redirection manuelle requise.`
        };
      }
    }
  }

  // Fallback to manual direct link
  return {
    success: true,
    mode: 'direct_link',
    url: directLinkUrl
  };
}
