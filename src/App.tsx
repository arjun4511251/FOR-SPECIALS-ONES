/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CreatorStudio } from './components/CreatorStudio';
import { RecipientView } from './components/RecipientView';

function getGiftIdFromLocation(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Path format: /gift/:giftId
  const path = window.location.pathname;
  if (path.startsWith('/gift/')) {
    const segments = path.replace(/^\/gift\//, '').split('/');
    if (segments[0]) {
      return decodeURIComponent(segments[0]);
    }
  }

  // 2. Query param format: ?gift=:giftId or ?id=:giftId
  const searchParams = new URLSearchParams(window.location.search);
  const paramGift = searchParams.get('gift') || searchParams.get('id');
  if (paramGift) {
    return paramGift;
  }

  return null;
}

export default function App() {
  const [giftId, setGiftId] = useState<string | null>(() => getGiftIdFromLocation());

  // Listen for browser navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      setGiftId(getGiftIdFromLocation());
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // If a giftId is detected, show the clean Recipient View
  if (giftId) {
    return <RecipientView giftId={giftId} />;
  }

  // Otherwise, default root "/" is the Creator Studio
  return <CreatorStudio />;
}
