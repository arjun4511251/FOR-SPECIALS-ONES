import { ScrapbookConfig } from '../types/scrapbook';
import { DEFAULT_SCRAPBOOK } from './defaultScrapbook';

export interface GiftTemplate {
  id: string;
  name: string;
  category: 'birthday' | 'anniversary' | 'romance' | 'friendship' | 'milestone';
  description: string;
  iconEmoji: string;
  badge: string;
  config: ScrapbookConfig;
}

export const GIFT_TEMPLATES: GiftTemplate[] = [
  {
    id: 'romantic-birthday',
    name: 'Romantic Birthday Dream',
    category: 'birthday',
    description: 'Pastel dreamscape with birthday cake, strawberry polaroids, romantic letter, and secret gift voucher.',
    iconEmoji: '🎂',
    badge: 'Popular',
    config: DEFAULT_SCRAPBOOK,
  },
  {
    id: 'romantic-anniversary',
    name: 'Endless Love Anniversary',
    category: 'anniversary',
    description: 'A celebration of shared years, unforgettable milestones, deep gratitude, and heartfelt vows for the future.',
    iconEmoji: '💍',
    badge: 'Romantic',
    config: {
      ...DEFAULT_SCRAPBOOK,
      romanticKicker: 'To my soulmate, my love, my forever home',
      openingQuestion: 'Do you remember the day we promised forever?',
      heroHeadline: 'Happy Anniversary, My Love',
      heroSubtext: 'Every chapter with you is sweeter than the last. Looking back at our story and celebrating the lifetime still ahead.',
      loveLetter: {
        ...DEFAULT_SCRAPBOOK.loveLetter,
        salutation: 'To my wonderful love, 💍💖',
        paragraphs: [
          'Happy Anniversary to the person who makes every ordinary day feel like an extraordinary miracle. Through every high and low, you have been my greatest comfort, my favorite laugh, and my greatest blessing.',
          'Looking back at all our photos and the memories we have created together fills my heart with so much pride and happiness. Thank you for choosing me, for loving me unconditionally, and for making life the greatest adventure.',
          'Here is to another year of holding hands, late-night talks, slow mornings, and loving each other more fiercely with every single breath.',
        ],
        closing: 'Yours for all our tomorrows, 🕊️',
        psNote: 'P.S. Scroll down to claim our special anniversary celebration date night! 🥂✨',
      },
      finalSurprise: {
        cakeTitle: 'A Sweet Toast to Our Love Story',
        cakeMessage: 'May our love continue to deepen, bloom, and shine brighter with every year we share together.',
        couponTitle: 'One Dream Date Night Voucher',
        couponSubtitle: 'Valid for: Anything your heart desires',
        couponDetails: 'Redeemable anytime for candlelight dinner, zero chores, and undivided attention all night long.',
        couponCode: 'ANNIVERSARY-FOREVER-US',
        personalPromise: 'I promise to keep choosing you, loving you, and making you feel cherished every single day.',
      },
    },
  },
  {
    id: 'love-letter-scrapbook',
    name: 'Digital Love Letter & Memories',
    category: 'romance',
    description: 'An intimate, vintage-inspired romantic letter packed with nostalgic memories, custom ink styling, and cute stickers.',
    iconEmoji: '💌',
    badge: 'Sweet',
    config: {
      ...DEFAULT_SCRAPBOOK,
      romanticKicker: 'A small piece of my heart written just for you',
      openingQuestion: 'Can I tell you how much you mean to me?',
      heroHeadline: 'Letters From My Heart To Yours',
      heroSubtext: 'Words could never fully capture it, but here is a digital keepsake of all the reasons you have my entire heart.',
      finalSurprise: {
        cakeTitle: 'Sweetest Wish for You',
        cakeMessage: 'You make the world warmer, softer, and more beautiful just by being in it.',
        couponTitle: 'Unlimited Hugs & Kiss Coupons',
        couponSubtitle: 'Never expires, infinite refills',
        couponDetails: 'Redeemable 24/7 for warm bear hugs, forehead kisses, and gentle back massages.',
        couponCode: 'ETERNAL-LOVE-HUGS',
        personalPromise: 'I promise to always listen, always stand by you, and always remind you how precious you are.',
      },
    },
  },
  {
    id: 'best-friend-gift',
    name: 'Best Friend Forever Keepsake',
    category: 'friendship',
    description: 'A fun, heartwarming friendship scrapbook celebrating chaotic memories, inside jokes, and unwavering support.',
    iconEmoji: '👯',
    badge: 'Friendship',
    config: {
      ...DEFAULT_SCRAPBOOK,
      recipientName: 'Bestie',
      senderName: 'Your Partner-in-Crime',
      nickname: 'Main Character',
      birthdayDate: 'Anytime',
      romanticKicker: 'To the truest, wildest, best friend anyone could ever ask for',
      openingQuestion: 'Are you ready for your bestie appreciation surprise?',
      heroHeadline: 'To The Best Friend in the World',
      heroSubtext: 'From crying laughing over stupid jokes to always having each other’s backs. Here is a scrapbook of our iconic friendship.',
      loveLetter: {
        salutation: 'Hey Bestie! 🌟',
        paragraphs: [
          'I wanted to make this digital scrapbook to remind you just how deeply appreciated and loved you are! 💖 You are the first person I want to text with good news, bad news, or completely unhinged memes.',
          'Thank you for always listening without judging, for backing me up, and for making ordinary days feel like a comedy special. You deserve the world and so much more!',
          'Never forget how strong, smart, hilarious, and radiant you are. No matter where life takes us, you will always be my number one bestie.',
        ],
        closing: 'Best friends forever and ever, 👯‍♀️✨',
        psNote: 'P.S. Scroll down to claim your free boba / dinner pass on me! 🧋🍕',
        fontFamily: 'caveat',
        fontSize: 'md',
        inkColor: 'rose',
        waxSealEmoji: '⭐',
        stampEmoji: '👯',
        decorativeStickers: ['🌟', '🧋', '🍕', '💖', '🎉', '🌸'],
      },
      reasons: [
        {
          id: 'reason-1',
          number: 1,
          title: 'You give the absolute best advice',
          description: 'Even when I do not want to hear the truth, you tell me with love and make everything easier.',
          sticker: 'sparkle',
        },
        {
          id: 'reason-2',
          number: 2,
          title: 'Our telepathic eye contact',
          description: 'We can literally communicate entire conversations across a crowded room with just one look.',
          sticker: 'smile',
        },
        {
          id: 'reason-3',
          number: 3,
          title: 'You celebrate my wins like your own',
          description: 'Having a friend who genuinely hypes you up and wants to see you succeed is the greatest gift.',
          sticker: 'star',
        },
      ],
      finalSurprise: {
        cakeTitle: 'Friendship Appreciation Treat',
        cakeMessage: 'Thank you for being you. You make life 1000x more fun!',
        couponTitle: 'One Free Dinner & Boba Hangout',
        couponSubtitle: 'Sponsored by your bestie',
        couponDetails: 'Redeemable anytime for your favorite comfort food, snacks, and deep conversations with zero bill for you.',
        couponCode: 'BESTIE-BOBA-PASS',
        personalPromise: 'I promise to always be there when you need a distraction, a shoulder to cry on, or someone to cause chaos with.',
      },
      secretLockConfig: {
        enabled: true,
        passcode: '1234',
        hint: 'Our friendship passcode is 1234!',
        title: 'Bestie Vault Entry',
        subtitle: 'Enter the secret PIN to unwrap your friendship surprise.',
      },
    },
  },
];
