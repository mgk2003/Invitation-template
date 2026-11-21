export interface EventItem {
  title: string;
  date: string;
  venue: string;
  time: string;
  mapLink: string;
}

export interface TipItem {
  iconType: 'hashtag' | 'map';
  title: string;
  text: string;
}

export interface Couple {
  groomName: string;
  brideName: string;
  logoSrc?: string;
  logoAlt?: string;
  photoSrc?: string;
  photoAlt: string;
}

export interface Dates {
  weddingDatetime: string;
  weddingDateDisplay: string;
  saveTheDateDisplay: string;
  weddingTimeDisplay: string;
}

export interface Hero {
  introText: string;
}

export interface InviteCard {
  loveMessage: string;
  subtitle: string;
}

export interface MeetSection {
  labelTop: string;
  title: string;
  sectionHeading: string;
  bio: string;
}

export interface MessageSection {
  title: string;
  paragraph1: string;
  paragraph2: string;
  ctaBadge: string;
}

export interface CountdownSection {
  gettingMarriedText: string;
  message: string;
}

export interface ThingsToKnow {
  labelTop: string;
  title: string;
  description: string;
  surpriseMessage: string;
  tips: TipItem[];
}

export interface Social {
  instagramHandle: string;
  instagramLink: string;
  instagramHandle2?: string;
  instagramLink2?: string;
}

export interface Footer {
  credit: string;
}

export interface Music {
  src: string;
  volume: number;
}

export type InvitationStatus = 'Draft' | 'Active' | 'Inactive' | 'Completed';

export interface WeddingContent {
  _id?: string;
  slug: string;
  status: InvitationStatus;
  backgroundImage?: string;
  couple: Couple;
  dates: Dates;
  hero: Hero;
  inviteCard: InviteCard;
  events: EventItem[];
  meetSection: MeetSection;
  messageSection: MessageSection;
  countdownSection: CountdownSection;
  thingsToKnow: ThingsToKnow;
  social: Social;
  footer: Footer;
  music: Music;
  createdAt?: string;
  updatedAt?: string;
  views?: number;
}

export interface BackgroundOption {
  id: string;
  name: string;
  tagline: string;
  description: string;
  src: string;
  previewSrc: string;
}

export const BACKGROUND_OPTIONS: BackgroundOption[] = [
  {
    id: 'background_1',
    name: 'Theme 1: Royal Heritage & Golden Radiance',
    tagline: 'Traditional Auspicious Grandeur',
    description: 'Opulent traditional celebration featuring warm golden mandap aura, sacred ceremonial motifs, and festive royal grace.',
    src: '/assets/background_1.png',
    previewSrc: '/assets/preview_1.jpg',
  },
  {
    id: 'background_2',
    name: 'Theme 2: Ethereal Grace & Floral Serenade',
    tagline: 'Timeless Romance & Classic Ivory',
    description: 'Subtle pastel sophistication adorned with delicate floral botanicals, gentle candlelight radiance, and pure eternal elegance.',
    src: '/assets/background_2.png',
    previewSrc: '/assets/preview_2.jpg',
  },
  {
    id: 'background_3',
    name: 'Theme 3: Majestic Twilight & Crescent Splendor',
    tagline: 'Regal Nocturnal Charm & Jewel Tones',
    description: 'Grand evening festivities illuminated by shimmering celestial stars, opulent jewel-toned velvet textures, and luminous celebration aura.',
    src: '/assets/background_3.png',
    previewSrc: '/assets/preview_3.jpg',
  },
];

export const getBackgroundImageUrl = (bgId?: string): string => {
  if (!bgId) return '/assets/background_1.png';
  const matched = BACKGROUND_OPTIONS.find((opt) => opt.id === bgId);
  if (matched) return matched.src;
  if (bgId.startsWith('/') || bgId.startsWith('http')) return bgId;
  if (bgId.endsWith('.png') || bgId.endsWith('.jpg') || bgId.endsWith('.webp')) {
    return `/assets/${bgId}`;
  }
  return `/assets/${bgId}.png`;
};
