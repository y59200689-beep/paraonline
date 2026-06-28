import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cleanPhoneNumber, interpolateTemplate, sendWhatsAppMessage } from '../lib/whatsapp';

// Mock verifyAdminSession from session
vi.mock('@/lib/session', () => ({
  verifyAdminSession: vi.fn(() => Promise.resolve({ id: 'admin-1', username: 'admin', role: 'owner' }))
}));

describe('WhatsApp Notification Utility Helpers', () => {
  it('should clean and format Moroccan phone numbers correctly', () => {
    expect(cleanPhoneNumber('0661223344')).toBe('212661223344');
    expect(cleanPhoneNumber('+212 6 61 22 33 44')).toBe('212661223344');
    expect(cleanPhoneNumber('06-61-22-33-44')).toBe('212661223344');
    expect(cleanPhoneNumber('212661223344')).toBe('212661223344');
  });

  it('should replace template tokens correctly', () => {
    const template = 'Bonjour {customer_name}, votre commande #{order_id} est confirmée. Total: {cart_total} DH.';
    const vars = {
      customer_name: 'Ahmed',
      order_id: 'PO-9988',
      cart_total: '450'
    };
    const expected = 'Bonjour Ahmed, votre commande #PO-9988 est confirmée. Total: 450 DH.';
    expect(interpolateTemplate(template, vars)).toBe(expected);
  });

  it('should fallback to empty string if a variable is missing', () => {
    const template = 'Bonjour {customer_name}, votre coupon est {discount_code}.';
    const vars = {
      customer_name: 'Ahmed'
    };
    const expected = 'Bonjour Ahmed, votre coupon est .';
    expect(interpolateTemplate(template, vars as any)).toBe(expected);
  });
});

describe('sendWhatsAppMessage Provider routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should default to direct manual link mode when no provider is set', async () => {
    const settings = {};
    const res = await sendWhatsAppMessage('0661223344', 'Test Message', settings);
    expect(res.success).toBe(true);
    expect(res.mode).toBe('direct_link');
    expect(res.url).toContain('https://api.whatsapp.com/send?phone=212661223344');
  });

  it('should call Twilio API when Twilio provider is configured', async () => {
    const settings = {
      whatsappProvider: 'twilio',
      twilioAccountSid: 'AC_MOCK_SID',
      twilioAuthToken: 'MOCK_TOKEN',
      twilioFromNumber: '+14155238886'
    };

    const fetchMock = vi.spyOn(global, 'fetch').mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ sid: 'SM_MOCK_SID', status: 'queued' })
      } as Response);
    });

    const res = await sendWhatsAppMessage('0661223344', 'Test Message', settings);
    
    expect(res.success).toBe(true);
    expect(res.mode).toBe('twilio');
    expect(res.messageId).toBe('SM_MOCK_SID');
    expect(fetchMock).toHaveBeenCalled();
  });

  it('should call Meta Cloud API when cloud_api provider is configured', async () => {
    const settings = {
      whatsappProvider: 'cloud_api',
      whatsappCloudAccessToken: 'EAAG_MOCK_TOKEN',
      whatsappCloudPhoneNumberId: '10654789'
    };

    const fetchMock = vi.spyOn(global, 'fetch').mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ messages: [{ id: 'wamid.MOCK_ID' }] })
      } as Response);
    });

    const res = await sendWhatsAppMessage('0661223344', 'Test Message', settings);

    expect(res.success).toBe(true);
    expect(res.mode).toBe('cloud_api');
    expect(res.messageId).toBe('wamid.MOCK_ID');
    expect(fetchMock).toHaveBeenCalled();
  });
});
