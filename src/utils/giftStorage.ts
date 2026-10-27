import { ScrapbookConfig } from '../types/scrapbook';
import { DEFAULT_SCRAPBOOK } from '../data/defaultScrapbook';
import {
  ExpirationSetting,
  calculateExpirationDate,
  isGiftExpired,
} from './expiration';

export interface PublishResult {
  id: string;
  url: string;
  editToken: string;
  expiresAt: string | null;
  expirationSetting: string;
  status: 'active' | 'expired';
}

export interface FetchGiftResult {
  status: 'ok' | 'expired' | 'not_found';
  gift?: ScrapbookConfig;
  id?: string;
  recipientName?: string;
  senderName?: string;
  expiresAt?: string | null;
  expiredAt?: string | null;
  createdAt?: string;
  isOwner?: boolean;
  message?: string;
}

const LOCAL_GIFTS_KEY = 'published_gifts_store_v1';
const CREATOR_DRAFT_KEY = 'creator_studio_current_draft_v1';
const CREATOR_EDIT_SESSION_KEY = 'creator_studio_edit_session_v1';

// Save current working draft in localStorage
export function saveLocalDraft(config: ScrapbookConfig): void {
  try {
    localStorage.setItem(CREATOR_DRAFT_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Failed to save draft to localStorage:', e);
  }
}

// Load draft or fallback to default
export function loadLocalDraft(): ScrapbookConfig {
  try {
    const raw = localStorage.getItem(CREATOR_DRAFT_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load draft from localStorage:', e);
  }
  return DEFAULT_SCRAPBOOK;
}

// Track active published gift ID & edit token so creator can re-edit
export function getSavedEditSession(): { id: string; editToken: string; expiresAt?: string | null } | null {
  try {
    const raw = localStorage.getItem(CREATOR_EDIT_SESSION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return null;
}

export function saveEditSession(id: string, editToken: string, expiresAt?: string | null): void {
  try {
    localStorage.setItem(CREATOR_EDIT_SESSION_KEY, JSON.stringify({ id, editToken, expiresAt }));
  } catch {}
}

export function clearEditSession(): void {
  try {
    localStorage.removeItem(CREATOR_EDIT_SESSION_KEY);
  } catch {}
}

// Upload image through server API or return data URL
export async function uploadImagePayload(dataUrl: string, filename?: string): Promise<string> {
  if (!dataUrl.startsWith('data:')) {
    return dataUrl;
  }

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl, filename }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.url) {
        return data.url;
      }
    }
  } catch (err) {
    console.warn('Server upload failed, falling back to embedded data URL:', err);
  }

  return dataUrl;
}

// Recursively process photos/background to upload any data URLs
export async function prepareGiftForPublishing(config: ScrapbookConfig): Promise<ScrapbookConfig> {
  const cloned: ScrapbookConfig = JSON.parse(JSON.stringify(config));

  // Upload photos
  if (cloned.photos && cloned.photos.length > 0) {
    cloned.photos = await Promise.all(
      cloned.photos.map(async (p, idx) => {
        if (p.url && p.url.startsWith('data:')) {
          const uploadedUrl = await uploadImagePayload(p.url, `photo_${idx}`);
          return { ...p, url: uploadedUrl };
        }
        return p;
      })
    );
  }

  // Upload memories photos
  if (cloned.memories && cloned.memories.length > 0) {
    cloned.memories = await Promise.all(
      cloned.memories.map(async (m, idx) => {
        if (m.photoUrl && m.photoUrl.startsWith('data:')) {
          const uploadedUrl = await uploadImagePayload(m.photoUrl, `memory_${idx}`);
          return { ...m, photoUrl: uploadedUrl };
        }
        return m;
      })
    );
  }

  // Upload background image if needed
  if (cloned.backgroundConfig?.url && cloned.backgroundConfig.url.startsWith('data:')) {
    const uploadedUrl = await uploadImagePayload(cloned.backgroundConfig.url, 'background');
    cloned.backgroundConfig.url = uploadedUrl;
  }

  return cloned;
}

// Publish or Update Gift to server & local backup
export async function publishGift(
  config: ScrapbookConfig,
  existingId?: string,
  existingToken?: string,
  expirationSetting: ExpirationSetting = '1m',
  customExpiresAt?: string | null
): Promise<PublishResult> {
  const preparedConfig = await prepareGiftForPublishing(config);

  // 1. Attempt API persist
  try {
    if (existingId) {
      const res = await fetch(`/api/gifts/${encodeURIComponent(existingId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-edit-token': existingToken || '',
        },
        body: JSON.stringify({
          gift: preparedConfig,
          editToken: existingToken,
          expirationSetting,
          customExpiresAt,
          renew: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const giftId = data.id || existingId;
        const editToken = data.editToken || existingToken || '';
        const expiresAt = data.expiresAt;
        saveEditSession(giftId, editToken, expiresAt);
        backupLocally(giftId, preparedConfig, editToken, expiresAt, expirationSetting);
        return {
          id: giftId,
          url: `/gift/${giftId}`,
          editToken,
          expiresAt,
          expirationSetting: data.expirationSetting || expirationSetting,
          status: 'active',
        };
      }
    }

    const res = await fetch('/api/gifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gift: preparedConfig,
        expirationSetting,
        customExpiresAt,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const giftId = data.id;
      const editToken = data.editToken;
      const expiresAt = data.expiresAt;
      saveEditSession(giftId, editToken, expiresAt);
      backupLocally(giftId, preparedConfig, editToken, expiresAt, expirationSetting);
      return {
        id: giftId,
        url: `/gift/${giftId}`,
        editToken,
        expiresAt,
        expirationSetting: data.expirationSetting || expirationSetting,
        status: 'active',
      };
    }
  } catch (err) {
    console.warn('API publish error, falling back to browser-local store:', err);
  }

  // Fallback to local storage persistence
  const fallbackId = existingId || `gift-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
  const fallbackToken = existingToken || Math.random().toString(36).substring(2, 10);
  const fallbackExpiresAt = calculateExpirationDate(expirationSetting, new Date(), customExpiresAt);

  backupLocally(fallbackId, preparedConfig, fallbackToken, fallbackExpiresAt, expirationSetting);
  saveEditSession(fallbackId, fallbackToken, fallbackExpiresAt);

  return {
    id: fallbackId,
    url: `/gift/${fallbackId}`,
    editToken: fallbackToken,
    expiresAt: fallbackExpiresAt,
    expirationSetting,
    status: 'active',
  };
}

// Renew or Extend a Gift
export async function renewGift(
  id: string,
  editToken: string,
  expirationSetting: ExpirationSetting = '1m',
  customExpiresAt?: string | null
): Promise<{ success: boolean; expiresAt?: string | null; error?: string }> {
  try {
    const res = await fetch(`/api/gifts/${encodeURIComponent(id)}/renew`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-edit-token': editToken,
      },
      body: JSON.stringify({
        editToken,
        expirationSetting,
        customExpiresAt,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      saveEditSession(id, editToken, data.expiresAt);
      
      const raw = localStorage.getItem(LOCAL_GIFTS_KEY);
      if (raw) {
        const store = JSON.parse(raw);
        if (store[id]) {
          store[id].expiresAt = data.expiresAt;
          store[id].expirationSetting = expirationSetting;
          store[id].status = 'active';
          localStorage.setItem(LOCAL_GIFTS_KEY, JSON.stringify(store));
        }
      }

      return { success: true, expiresAt: data.expiresAt };
    } else {
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.error || 'Failed to renew gift' };
    }
  } catch (err: any) {
    console.error('Error renewing gift:', err);
    return { success: false, error: err.message || 'Network error while renewing gift' };
  }
}

// Fetch gift from server or local backup, with expiration checking
export async function fetchGiftById(id: string, callerToken?: string): Promise<FetchGiftResult> {
  const session = getSavedEditSession();
  const effectiveToken = callerToken || (session && session.id === id ? session.editToken : '');

  // 1. Try server API
  try {
    const headers: Record<string, string> = {};
    if (effectiveToken) {
      headers['x-edit-token'] = effectiveToken;
    }

    const res = await fetch(`/api/gifts/${encodeURIComponent(id)}`, { headers });
    
    // Expired gift handling (Server returned 410)
    if (res.status === 410) {
      const data = await res.json();
      return {
        status: 'expired',
        id: data.id || id,
        recipientName: data.recipientName,
        senderName: data.senderName,
        expiredAt: data.expiredAt,
        createdAt: data.createdAt,
        isOwner: Boolean(data.isOwner),
        message: data.message,
      };
    }

    if (res.status === 404) {
      return { status: 'not_found' };
    }

    if (res.ok) {
      const data = await res.json();
      if (data && data.gift) {
        backupLocally(id, data.gift, effectiveToken, data.expiresAt, data.expirationSetting);
        return {
          status: data.isExpired && !data.isOwner ? 'expired' : 'ok',
          gift: data.gift,
          id: data.id,
          expiresAt: data.expiresAt,
          createdAt: data.createdAt,
          isOwner: Boolean(data.isOwner),
        };
      }
    }
  } catch (err) {
    console.warn('Failed to fetch gift from API, checking local backup:', err);
  }

  // 2. Check local fallback
  try {
    const raw = localStorage.getItem(LOCAL_GIFTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const entry = parsed[id];
      if (entry) {
        const giftObj = entry.gift || (entry.recipientName ? entry : null);
        const expiresAt = entry.expiresAt;
        const isOwner = Boolean(effectiveToken && entry.editToken === effectiveToken);

        // Check if expired locally
        if (isGiftExpired(expiresAt) && !isOwner) {
          return {
            status: 'expired',
            id,
            recipientName: giftObj?.recipientName,
            senderName: giftObj?.senderName,
            expiredAt: expiresAt,
            isOwner: false,
            message: 'This gift link has expired.',
          };
        }

        if (giftObj) {
          return {
            status: 'ok',
            gift: giftObj,
            id,
            expiresAt,
            isOwner,
          };
        }
      }
    }
  } catch (e) {
    console.warn('Error reading from local gifts backup:', e);
  }

  return { status: 'not_found' };
}

function backupLocally(
  id: string,
  gift: ScrapbookConfig,
  editToken?: string,
  expiresAt?: string | null,
  expirationSetting?: string
): void {
  try {
    const raw = localStorage.getItem(LOCAL_GIFTS_KEY);
    const store = raw ? JSON.parse(raw) : {};
    store[id] = {
      gift,
      editToken: editToken || store[id]?.editToken,
      expiresAt: expiresAt !== undefined ? expiresAt : store[id]?.expiresAt,
      expirationSetting: expirationSetting || store[id]?.expirationSetting || '1m',
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_GIFTS_KEY, JSON.stringify(store));
  } catch (e) {
    console.warn('Could not backup gift to localStorage:', e);
  }
}
