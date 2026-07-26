import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InvitationDocument = Invitation & Document;

export enum InvitationStatus {
  DRAFT = 'Draft',
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  COMPLETED = 'Completed',
}

@Schema({ _id: false })
export class Couple {
  @Prop({ required: true })
  groomName: string;

  @Prop({ required: true })
  brideName: string;

  @Prop({ default: '' })
  logoSrc: string;

  @Prop({ default: '' })
  logoAlt: string;

  @Prop({ default: '' })
  photoSrc: string;

  @Prop({ default: 'Couple Photo' })
  photoAlt: string;
}

@Schema({ _id: false })
export class Dates {
  @Prop({ required: true })
  weddingDatetime: string;

  @Prop({ default: '' })
  weddingDateDisplay: string;

  @Prop({ default: '' })
  saveTheDateDisplay: string;

  @Prop({ default: '' })
  weddingTimeDisplay: string;
}

@Schema({ _id: false })
export class Hero {
  @Prop({ default: 'With joyful hearts, we invite you to witness our forever' })
  introText: string;
}

@Schema({ _id: false })
export class InviteCard {
  @Prop({ default: '"Two souls, one heart, a journey forever started. Join us as we celebrate the beginning of our forever."' })
  loveMessage: string;

  @Prop({ default: 'We joyfully invite you to the wedding of' })
  subtitle: string;
}

@Schema({ _id: false })
export class EventItem {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  venue: string;

  @Prop({ required: true })
  time: string;

  @Prop({ default: '' })
  mapLink: string;
}

@Schema({ _id: false })
export class MeetSection {
  @Prop({ default: 'CELEBRATING OUR LOVE' })
  labelTop: string;

  @Prop({ default: 'The Couple' })
  title: string;

  @Prop({ default: 'The Happy Couple' })
  sectionHeading: string;

  @Prop({ default: '"A journey of love that began with a beautiful \'Yes\'. Together, we are excited to start this new chapter of our lives, hand in hand, forever."' })
  bio: string;
}

@Schema({ _id: false })
export class MessageSection {
  @Prop({ default: 'A Message From Our Hearts' })
  title: string;

  @Prop({ default: '"We are both so delighted that you are able to join us in celebrating what we hope will be one of the happiest days of our lives."' })
  paragraph1: string;

  @Prop({ default: '"We would like to take this opportunity to thank everyone most sincerely for their kindness. We are looking forward to seeing you at the wedding!"' })
  paragraph2: string;

  @Prop({ default: "CAN'T WAIT TO SEE YOU" })
  ctaBadge: string;
}

@Schema({ _id: false })
export class CountdownSection {
  @Prop({ default: 'ARE GETTING MARRIED IN' })
  gettingMarriedText: string;

  @Prop({ default: '"Counting down the moments until we start our journey of forever. We can\'t wait to celebrate this magical day with you."' })
  message: string;
}

@Schema({ _id: false })
export class TipItem {
  @Prop({ required: true, enum: ['hashtag', 'map'] })
  iconType: 'hashtag' | 'map';

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  text: string;
}

@Schema({ _id: false })
export class ThingsToKnow {
  @Prop({ default: 'Little Details' })
  labelTop: string;

  @Prop({ default: 'Things to Know' })
  title: string;

  @Prop({ default: 'A few thoughtful details to help you enjoy every magical moment of our celebration.' })
  description: string;

  @Prop({ default: '"Your presence is the greatest gift of all. We can\'t wait to see you!"' })
  surpriseMessage: string;

  @Prop({ type: [TipItem], default: [] })
  tips: TipItem[];
}

@Schema({ _id: false })
export class Social {
  @Prop({ default: '' })
  instagramHandle: string;

  @Prop({ default: '' })
  instagramLink: string;

  @Prop({ default: '' })
  instagramHandle2?: string;

  @Prop({ default: '' })
  instagramLink2?: string;
}

@Schema({ _id: false })
export class Footer {
  @Prop({ default: 'CREW FOTOS' })
  credit: string;
}

@Schema({ _id: false })
export class Music {
  @Prop({ default: '/bg-music.mp3' })
  src: string;

  @Prop({ default: 0.7 })
  volume: number;
}

@Schema({ timestamps: true })
export class Invitation {
  @Prop({ required: true, unique: true, index: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true, enum: InvitationStatus, default: InvitationStatus.DRAFT })
  status: InvitationStatus;

  @Prop({ type: Couple, required: true })
  couple: Couple;

  @Prop({ type: Dates, required: true })
  dates: Dates;

  @Prop({ type: Hero, default: () => ({}) })
  hero: Hero;

  @Prop({ type: InviteCard, default: () => ({}) })
  inviteCard: InviteCard;

  @Prop({ type: [EventItem], default: [] })
  events: EventItem[];

  @Prop({ type: MeetSection, default: () => ({}) })
  meetSection: MeetSection;

  @Prop({ type: MessageSection, default: () => ({}) })
  messageSection: MessageSection;

  @Prop({ type: CountdownSection, default: () => ({}) })
  countdownSection: CountdownSection;

  @Prop({ type: ThingsToKnow, default: () => ({}) })
  thingsToKnow: ThingsToKnow;

  @Prop({ type: Social, default: () => ({}) })
  social: Social;

  @Prop({ type: Footer, default: () => ({}) })
  footer: Footer;

  @Prop({ type: Music, default: () => ({}) })
  music: Music;

  @Prop({ default: 0 })
  views: number;

  @Prop({
    type: [{ ip: { type: String }, timestamp: { type: Date } }],
    default: [],
  })
  viewLogs: { ip: string; timestamp: Date }[];
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);
