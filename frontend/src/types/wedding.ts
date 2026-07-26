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
