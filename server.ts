import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Ensure data & uploads directories exist
const DATA_DIR = path.resolve(__dirname, 'data');
const UPLOADS_DIR = path.resolve(__dirname, 'public', 'uploads');
const GIFTS_FILE = path.join(DATA_DIR, 'gifts.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Helpers for persistent gift store
export interface StoredGift {
  id: string;
  editToken: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  expirationSetting: string;
  customExpiresAt?: string | null;
  status: 'active' | 'expired' | 'revoked';
  gift: any;
}

/**
 * Calendar month addition with end-of-month clamping
 */
function addCalendarMonths(date: Date, months: number): Date {
  const d = new Date(date.getTime());
  const originalDay = d.getDate();
  const targetMonth = d.getMonth() + months;
  
  d.setMonth(targetMonth);
  const normalizedTargetMonth = ((targetMonth % 12) + 12) % 12;
  if (d.getMonth() !== normalizedTargetMonth) {
    d.setDate(0); // clamp to last day of intended month
  }
  return d;
}

/**
 * Server-authoritative expiration calculation in UTC
 */
function calculateExpirationDate(
  setting: string,
  baseDate: Date = new Date(),
  customIso?: string | null
): string | null {
  if (setting === 'never') {
    return null;
  }

  if (setting === 'custom') {
    if (!customIso) {
      throw new Error('Please select a custom expiration date and time.');
    }
    const customDate = new Date(customIso);
    if (isNaN(customDate.getTime())) {
      throw new Error('Invalid custom expiration date.');
    }
    if (customDate.getTime() <= Date.now()) {
      throw new Error('Custom expiration date must be in the future.');
    }
    return customDate.toISOString();
  }

  const d = new Date(baseDate.getTime());

  switch (setting) {
    case '1d':
      d.setDate(d.getDate() + 1);
      return d.toISOString();
    case '7d':
      d.setDate(d.getDate() + 7);
      return d.toISOString();
    case '15d':
      d.setDate(d.getDate() + 15);
      return d.toISOString();
    case '1m':
      return addCalendarMonths(d, 1).toISOString();
    case '3m':
      return addCalendarMonths(d, 3).toISOString();
    case '6m':
      return addCalendarMonths(d, 6).toISOString();
    case '1y':
      return addCalendarMonths(d, 12).toISOString();
    default:
      return addCalendarMonths(d, 1).toISOString();
  }
}

function isGiftExpired(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false;
  const time = new Date(expiresAt).getTime();
  if (isNaN(time)) return false;
  return Date.now() > time;
}

/**
 * Reads gifts and applies deliberate, backward-compatible migration for legacy gifts.
 * Migration Policy:
 * - Newly published gifts default to 1 calendar month.
 * - Older gifts without expiresAt are given 1 calendar month from their createdAt date.
 * - If createdAt + 1 month has already passed, a 30-day grace period is granted from now
 *   so existing links do not break unexpectedly, while preserving owner renewal rights.
 */
function readGifts(): Record<string, StoredGift> {
  try {
    if (fs.existsSync(GIFTS_FILE)) {
      const data = fs.readFileSync(GIFTS_FILE, 'utf-8');
      const gifts: Record<string, any> = JSON.parse(data);
      let migrated = false;

      for (const [id, entry] of Object.entries(gifts)) {
        if (!entry.expiresAt && entry.expiresAt !== null) {
          migrated = true;
          const createdDate = entry.createdAt ? new Date(entry.createdAt) : new Date();
          let calculatedExpiry = addCalendarMonths(createdDate, 1);

          // If calculated expiry is already in the past, grant 30-day grace period from now
          if (calculatedExpiry.getTime() <= Date.now()) {
            const graceDate = new Date();
            graceDate.setDate(graceDate.getDate() + 30);
            calculatedExpiry = graceDate;
            entry.expirationSetting = '1m_legacy_grace';
          } else {
            entry.expirationSetting = '1m';
          }

          entry.expiresAt = calculatedExpiry.toISOString();
          entry.status = isGiftExpired(entry.expiresAt) ? 'expired' : 'active';
        } else {
          // Update status dynamically if expired
          if (entry.expiresAt && isGiftExpired(entry.expiresAt) && entry.status === 'active') {
            entry.status = 'expired';
            migrated = true;
          }
        }
      }

      if (migrated) {
        writeGifts(gifts);
      }
      return gifts;
    }
  } catch (err) {
    console.error('Error reading gifts.json:', err);
  }
  return {};
}

function writeGifts(gifts: Record<string, StoredGift>): boolean {
  try {
    fs.writeFileSync(GIFTS_FILE, JSON.stringify(gifts, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing gifts.json:', err);
    return false;
  }
}

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/**
 * Protected asset delivery handler for uploaded photos.
 * Ensures expired gifts do not leave photos publicly downloadable through direct URLs.
 */
app.get('/uploads/:filename', (req, res, next) => {
  const { filename } = req.params;
  const filePath = path.join(UPLOADS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  const targetAssetUrl = `/uploads/${filename}`;
  const gifts = readGifts();
  const callerToken = (req.headers['x-edit-token'] as string) || (req.query.token as string);

  // Find gifts that reference this asset
  const referencingGifts: StoredGift[] = [];
  for (const entry of Object.values(gifts)) {
    let references = false;
    // Check photos
    if (entry.gift?.photos?.some((p: any) => p?.url === targetAssetUrl)) references = true;
    // Check memories
    if (entry.gift?.memories?.some((m: any) => m?.photoUrl === targetAssetUrl)) references = true;
    // Check background
    if (entry.gift?.backgroundConfig?.url === targetAssetUrl) references = true;

    if (references) {
      referencingGifts.push(entry);
    }
  }

  // If this asset belongs to gifts, check expiration
  if (referencingGifts.length > 0) {
    const hasActiveGift = referencingGifts.some((g) => !isGiftExpired(g.expiresAt));
    const isCallerOwner = referencingGifts.some((g) => callerToken && g.editToken === callerToken);

    // If ALL referencing gifts are expired and caller is not verified owner: REVOKE ACCESS
    if (!hasActiveGift && !isCallerOwner) {
      return res.status(410).json({
        error: 'expired_asset',
        message: 'This photo belongs to an expired digital gift and is no longer publicly accessible.',
      });
    }
  }

  // Otherwise serve safely
  res.sendFile(filePath);
});

// API: Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API: Image upload (Base64 or binary data)
app.post('/api/upload', (req, res) => {
  try {
    const { dataUrl, filename } = req.body;
    if (!dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).json({ error: 'dataUrl is required' });
    }

    const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://') || dataUrl.startsWith('/')) {
        return res.json({ url: dataUrl });
      }
      return res.status(400).json({ error: 'Invalid data URL format' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const extension = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'png';
    const cleanFilename = (filename ? filename.replace(/[^a-zA-Z0-9_-]/g, '') : 'img') + `_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${extension}`;
    const filePath = path.join(UPLOADS_DIR, cleanFilename);

    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    const publicUrl = `/uploads/${cleanFilename}`;
    res.json({ url: publicUrl });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: error.message || 'Failed to upload image' });
  }
});

// API: Get Gift by ID (Protected by server-side expiration logic)
app.get('/api/gifts/:id', (req, res) => {
  const gifts = readGifts();
  const entry = gifts[req.params.id];
  if (!entry) {
    return res.status(404).json({ error: 'not_found', message: 'Gift not found' });
  }

  const callerToken = (req.headers['x-edit-token'] as string) || (req.query.token as string);
  const isOwner = Boolean(callerToken && entry.editToken === callerToken);
  const expired = isGiftExpired(entry.expiresAt);

  // If expired and caller is not the owner: DO NOT leak private photos, letters, memories
  if (expired && !isOwner) {
    return res.status(410).json({
      error: 'expired',
      message: 'This gift link has expired. The creator can extend its availability or publish a new gift link.',
      id: entry.id,
      recipientName: entry.gift?.recipientName || 'Someone Special',
      senderName: entry.gift?.senderName,
      createdAt: entry.createdAt,
      expiredAt: entry.expiresAt,
      isExpired: true,
      status: 'expired',
      isOwner: false,
    });
  }

  // Active gift or owner access
  res.json({
    id: entry.id,
    gift: entry.gift,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    expiresAt: entry.expiresAt,
    expirationSetting: entry.expirationSetting,
    status: expired ? 'expired' : 'active',
    isExpired: expired,
    isOwner,
  });
});

// API: Create new published Gift (defaults to 1 calendar month)
app.post('/api/gifts', (req, res) => {
  try {
    const { gift, customSlug, expirationSetting = '1m', customExpiresAt } = req.body;
    if (!gift) {
      return res.status(400).json({ error: 'Gift configuration is required' });
    }

    // Validate and calculate expiration
    let expiresAt: string | null = null;
    try {
      expiresAt = calculateExpirationDate(expirationSetting, new Date(), customExpiresAt);
    } catch (valErr: any) {
      return res.status(400).json({ error: valErr.message || 'Invalid expiration setting' });
    }

    const gifts = readGifts();
    
    // Generate clean unique ID
    let giftId = customSlug
      ? customSlug.toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 36)
      : '';
    
    if (!giftId || gifts[giftId]) {
      const recipientSlug = (gift.recipientName || 'gift')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 12);
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      giftId = `${recipientSlug}-${randomSuffix}`;
    }

    const editToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const now = new Date().toISOString();

    const storedEntry: StoredGift = {
      id: giftId,
      editToken,
      createdAt: now,
      updatedAt: now,
      expiresAt,
      expirationSetting,
      customExpiresAt: expirationSetting === 'custom' ? customExpiresAt : null,
      status: 'active',
      gift,
    };

    gifts[giftId] = storedEntry;
    writeGifts(gifts);

    res.status(201).json({
      id: giftId,
      editToken,
      url: `/gift/${giftId}`,
      createdAt: now,
      expiresAt,
      expirationSetting,
      status: 'active',
      gift,
    });
  } catch (error: any) {
    console.error('Error creating gift:', error);
    res.status(500).json({ error: 'Failed to publish gift' });
  }
});

// API: Update or Extend existing Gift
app.put('/api/gifts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { gift, editToken, expirationSetting, customExpiresAt, renew } = req.body;
    const gifts = readGifts();
    const existing = gifts[id];

    if (!existing) {
      return res.status(404).json({ error: 'Gift not found' });
    }

    // Owner authorization check
    const callerToken = (req.headers['x-edit-token'] as string) || editToken;
    if (!callerToken || existing.editToken !== callerToken) {
      return res.status(403).json({ error: 'Unauthorized: only the gift owner can update or renew this gift' });
    }

    const now = new Date().toISOString();

    // If expiration setting changed or renew requested, recalculate from now
    if (expirationSetting !== undefined || renew) {
      const setting = expirationSetting || existing.expirationSetting || '1m';
      try {
        existing.expiresAt = calculateExpirationDate(setting, new Date(), customExpiresAt);
        existing.expirationSetting = setting;
        existing.customExpiresAt = setting === 'custom' ? customExpiresAt : null;
        existing.status = 'active';
      } catch (valErr: any) {
        return res.status(400).json({ error: valErr.message || 'Invalid expiration setting' });
      }
    }

    if (gift) {
      existing.gift = gift;
    }
    existing.updatedAt = now;

    gifts[id] = existing;
    writeGifts(gifts);

    res.json({
      id,
      gift: existing.gift,
      updatedAt: existing.updatedAt,
      expiresAt: existing.expiresAt,
      expirationSetting: existing.expirationSetting,
      status: existing.status,
      editToken: existing.editToken,
      url: `/gift/${id}`,
    });
  } catch (error: any) {
    console.error('Error updating gift:', error);
    res.status(500).json({ error: 'Failed to update gift' });
  }
});

// API: Dedicated Renew / Extend Endpoint
app.post('/api/gifts/:id/renew', (req, res) => {
  try {
    const { id } = req.params;
    const { editToken, expirationSetting = '1m', customExpiresAt } = req.body;
    const gifts = readGifts();
    const existing = gifts[id];

    if (!existing) {
      return res.status(404).json({ error: 'Gift not found' });
    }

    const callerToken = (req.headers['x-edit-token'] as string) || editToken;
    if (!callerToken || existing.editToken !== callerToken) {
      return res.status(403).json({ error: 'Unauthorized: only the gift owner can renew this gift' });
    }

    // Recalculate expiration from now
    let newExpiresAt: string | null = null;
    try {
      newExpiresAt = calculateExpirationDate(expirationSetting, new Date(), customExpiresAt);
    } catch (valErr: any) {
      return res.status(400).json({ error: valErr.message || 'Invalid expiration setting' });
    }

    existing.expiresAt = newExpiresAt;
    existing.expirationSetting = expirationSetting;
    existing.customExpiresAt = expirationSetting === 'custom' ? customExpiresAt : null;
    existing.status = 'active';
    existing.updatedAt = new Date().toISOString();

    gifts[id] = existing;
    writeGifts(gifts);

    res.json({
      id,
      url: `/gift/${id}`,
      expiresAt: existing.expiresAt,
      expirationSetting: existing.expirationSetting,
      status: 'active',
      updatedAt: existing.updatedAt,
      message: 'Gift successfully renewed and active!',
    });
  } catch (error: any) {
    console.error('Error renewing gift:', error);
    res.status(500).json({ error: 'Failed to renew gift' });
  }
});

// Mount Vite or Static files
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Scrapbook Platform Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
