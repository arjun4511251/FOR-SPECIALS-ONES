export interface PhotoItem {
  id: string;
  url: string;
  caption: string;
  date?: string;
  note?: string;
  rotation?: number; // e.g. -3 to 3 degrees
}

export interface MemoryItem {
  id: string;
  title: string;
  date: string;
  location?: string;
  story: string;
  tag: string;
  photoUrl?: string;
}

export interface ReasonItem {
  id: string;
  number: number;
  title: string;
  description: string;
  sticker: 'heart' | 'flower' | 'sparkle' | 'star' | 'coffee' | 'smile';
}

export interface ScrapbookConfig {
  recipientName: string;
  senderName: string;
  nickname: string;
  birthdayDate: string; // YYYY-MM-DD or readable
  romanticKicker: string;
  openingQuestion: string;
  heroHeadline: string;
  heroSubtext: string;
  photos: PhotoItem[];
  memories: MemoryItem[];
  loveLetter: {
    salutation: string;
    paragraphs: string[];
    closing: string;
    psNote?: string;
    fontFamily?: 'dancing' | 'parisienne' | 'caveat' | 'marck' | 'courier' | 'playfair' | 'outfit';
    fontSize?: 'sm' | 'md' | 'lg' | 'xl';
    inkColor?: 'rose' | 'espresso' | 'wine' | 'midnight' | 'blush';
    waxSealEmoji?: string;
    stampEmoji?: string;
    decorativeStickers?: string[];
  };
  reasons: ReasonItem[];
  finalSurprise: {
    cakeTitle: string;
    cakeMessage: string;
    couponTitle: string;
    couponSubtitle: string;
    couponDetails: string;
    couponCode: string;
    personalPromise: string;
  };
  audioConfig: {
    soundtrackType: 'music-box' | 'custom-url';
    customUrl?: string;
    volume: number;
    title: string;
  };
  backgroundConfig?: {
    type: 'default' | 'image' | 'video';
    url?: string;
    enableOverlayEffects?: boolean;
  };
  secretLockConfig?: {
    enabled?: boolean;
    passcode: string;
    hint?: string;
    title?: string;
    subtitle?: string;
  };
}
