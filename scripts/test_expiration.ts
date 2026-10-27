import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const GIFTS_FILE = path.resolve(process.cwd(), 'data', 'gifts.json');

async function runTests() {
  console.log('--- Starting Comprehensive Expiration Test Suite ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${detail || 'Assertion failed'}`);
      failed++;
    }
  }

  // 1. Health check
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  assert(healthRes.ok, '1. Server health check is responding');

  // 2. Default expiration is 1 calendar month
  const pubDefaultRes = await fetch(`${BASE_URL}/api/gifts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gift: { recipientName: 'TestDefaultMonth', senderName: 'Tester' },
    }),
  });
  const defaultData = await pubDefaultRes.json();
  assert(pubDefaultRes.status === 201, '2.1 Create gift with default setting succeeds');
  assert(defaultData.expirationSetting === '1m', '2.2 Default expiration setting is "1m"');
  
  const createdDate = new Date(defaultData.createdAt);
  const expiryDate = new Date(defaultData.expiresAt);
  const expectedMonth = (createdDate.getMonth() + 1) % 12;
  assert(
    expiryDate.getMonth() === expectedMonth,
    '2.3 Default expiration is exactly one calendar month ahead',
    `Expected month ${expectedMonth}, got ${expiryDate.getMonth()}`
  );

  // 3. Selecting 7 days produces correct expiration
  const pub7dRes = await fetch(`${BASE_URL}/api/gifts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gift: { recipientName: 'Test7Days', senderName: 'Tester' },
      expirationSetting: '7d',
    }),
  });
  const data7d = await pub7dRes.json();
  assert(pub7dRes.status === 201, '3.1 Create gift with 7 days succeeds');
  assert(data7d.expirationSetting === '7d', '3.2 Setting is "7d"');
  const diff7dDays = Math.round((new Date(data7d.expiresAt).getTime() - new Date(data7d.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  assert(diff7dDays === 7, '3.3 Expiration timestamp is exactly 7 days ahead', `Got ${diff7dDays} days`);

  // 4. Custom future date & time saves correct timestamp
  const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
  const customIso = futureDate.toISOString();
  const pubCustomRes = await fetch(`${BASE_URL}/api/gifts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gift: { recipientName: 'TestCustom', senderName: 'Tester' },
      expirationSetting: 'custom',
      customExpiresAt: customIso,
    }),
  });
  const customData = await pubCustomRes.json();
  assert(pubCustomRes.status === 201, '4.1 Create custom date gift succeeds');
  assert(customData.expiresAt === customIso, '4.2 Custom timestamp exactly matches user selection');

  // 5. Invalid or past expiration date is rejected
  const pastDateIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const pubPastRes = await fetch(`${BASE_URL}/api/gifts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gift: { recipientName: 'TestPast', senderName: 'Tester' },
      expirationSetting: 'custom',
      customExpiresAt: pastDateIso,
    }),
  });
  assert(pubPastRes.status === 400, '5.1 Past custom date is rejected with HTTP 400');

  // 6. Active gift opens correctly
  const getActiveRes = await fetch(`${BASE_URL}/api/gifts/${defaultData.id}`);
  assert(getActiveRes.status === 200, '6.1 Active gift returns HTTP 200');
  const activeData = await getActiveRes.json();
  assert(activeData.status === 'active' && !activeData.isExpired, '6.2 Active gift status is "active"');
  assert(activeData.gift?.recipientName === 'TestDefaultMonth', '6.3 Active gift content is returned');

  // 7. Expired gift returns HTTP 410 to public visitors and completely hides private scrapbook content
  // Upload a private photo for this gift
  const imgRes = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      filename: 'private_love_photo',
    }),
  });
  const imgData = await imgRes.json();
  const privateAssetUrl = imgData.url;

  // Publish a gift with this private photo
  const pubExpRes = await fetch(`${BASE_URL}/api/gifts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gift: {
        recipientName: 'Juliet',
        senderName: 'Romeo',
        loveLetter: { paragraphs: ['My private confession that should never leak after expiration.'] },
        photos: [{ id: 'p1', url: privateAssetUrl, caption: 'Secret kiss' }],
      },
      expirationSetting: '1d',
    }),
  });
  const expGift = await pubExpRes.json();
  const expGiftId = expGift.id;
  const expGiftToken = expGift.editToken;

  // Now simulate expiration by setting expiresAt to 1 hour in the past in gifts.json
  const rawGifts = JSON.parse(fs.readFileSync(GIFTS_FILE, 'utf-8'));
  rawGifts[expGiftId].expiresAt = new Date(Date.now() - 3600000).toISOString();
  rawGifts[expGiftId].status = 'expired';
  fs.writeFileSync(GIFTS_FILE, JSON.stringify(rawGifts, null, 2), 'utf-8');

  // Test 7.1: Public visitor requesting expired gift
  const publicExpiredRes = await fetch(`${BASE_URL}/api/gifts/${expGiftId}`);
  assert(publicExpiredRes.status === 410, '7.1 Public visitor receives HTTP 410 Gone for expired gift');
  const publicExpiredJson = await publicExpiredRes.json();
  assert(publicExpiredJson.error === 'expired', '7.2 Response has error: "expired"');
  assert(!publicExpiredJson.gift, '7.3 Private scrapbook content is NOT returned to public visitor');
  assert(!publicExpiredJson.editToken, '7.4 Private owner token is NOT leaked');

  // Test 7.2: Protected photograph cannot be retrieved by public visitors after expiration
  const assetExpiredRes = await fetch(`${BASE_URL}${privateAssetUrl}`);
  assert(assetExpiredRes.status === 410, '7.5 Public direct asset URL for expired gift photo returns HTTP 410 Gone');

  // Test 7.3: Owner CAN access expired gift with their editToken to inspect and renew
  const ownerExpiredRes = await fetch(`${BASE_URL}/api/gifts/${expGiftId}`, {
    headers: { 'x-edit-token': expGiftToken },
  });
  assert(ownerExpiredRes.status === 200, '7.6 Verified owner can access their expired gift record (HTTP 200)');
  const ownerExpiredData = await ownerExpiredRes.json();
  assert(ownerExpiredData.isExpired === true && ownerExpiredData.isOwner === true, '7.7 Owner receives expiration status flag');

  // 8. Test owner vs unauthorized renewal
  const unauthorizedRenew = await fetch(`${BASE_URL}/api/gifts/${expGiftId}/renew`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      editToken: 'wrong_fake_token_123',
      expirationSetting: '1m',
    }),
  });
  assert(unauthorizedRenew.status === 403, '8.1 Unauthorized user cannot renew someone else\'s gift (HTTP 403)');

  // 9. Authorized creator CAN renew their expired gift
  const ownerRenew = await fetch(`${BASE_URL}/api/gifts/${expGiftId}/renew`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-edit-token': expGiftToken,
    },
    body: JSON.stringify({
      editToken: expGiftToken,
      expirationSetting: '1m',
    }),
  });
  assert(ownerRenew.status === 200, '9.1 Owner can successfully renew their expired gift');
  const renewedData = await ownerRenew.json();
  assert(renewedData.status === 'active', '9.2 Renewed gift status is now "active"');
  assert(renewedData.url === `/gift/${expGiftId}`, '9.3 Renewed gift preserves original URL and QR code target');

  // Now verify that public access is restored after renewal
  const publicAfterRenew = await fetch(`${BASE_URL}/api/gifts/${expGiftId}`);
  assert(publicAfterRenew.status === 200, '9.4 Public visitor can now view the renewed gift');

  // Verify that the photo asset is also restored
  const assetAfterRenew = await fetch(`${BASE_URL}${privateAssetUrl}`);
  assert(assetAfterRenew.status === 200, '9.5 Photo asset is accessible again after renewal');

  // 10. Existing gift compatibility
  const legacyGiftRes = await fetch(`${BASE_URL}/api/gifts/emma-f2yrji`);
  assert(legacyGiftRes.ok, '10.1 Legacy gift emma-f2yrji was loaded cleanly without error');
  const legacyData = await legacyGiftRes.json();
  assert(legacyData.expiresAt !== undefined, '10.2 Legacy gift received migrated expiration date');

  console.log(`\n--- Test Results: ${passed} passed, ${failed} failed ---`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
