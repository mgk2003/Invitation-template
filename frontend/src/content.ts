import type { WeddingContent } from './types/wedding';

export type { EventItem, TipItem, WeddingContent } from './types/wedding';

const defaultContent: WeddingContent = {
  slug: 'sample-wedding',
  status: 'Active',
  couple: {
    groomName: 'Naveen',
    brideName: 'Nandhini',
    logoSrc: '/coupleLogo.png',
    logoAlt: 'Naveen & Nandhini Logo',
    photoAlt: 'Naveen and Nandhini',
  },

  dates: {
    weddingDatetime: '2026-07-06T06:15:00',
    weddingDateDisplay: '6 JULY 2026',
    saveTheDateDisplay: 'JULY 06 - 2026',
    weddingTimeDisplay: '6:15 AM - 7:15 AM',
  },

  hero: {
    introText: 'With joyful hearts, we invite you to witness our forever',
  },

  inviteCard: {
    loveMessage:
      '"Two souls, one heart, a journey forever started. Join us as we celebrate the beginning of our forever."',
    subtitle: 'We joyfully invite you to the wedding of',
  },

  events: [
    {
      title: 'Engagement',
      date: 'Sunday, July 5th 2026',
      venue:
        'Sri Ram Mahal A/C, Kulamangalam Main Road, Opp. C.E.O.A. School, Kosakulam, Madurai',
      time: '6:00 PM Onwards',
      mapLink: 'https://maps.app.goo.gl/KVPCU4LGSqfw5PUUA',
    },
    {
      title: 'Wedding',
      date: 'Monday, July 6th 2026',
      venue: 'Arulmigu Subramaniya Swami Temple, Tirupparankundram',
      time: '6.15 a.m to 7.15 a.m',
      mapLink: 'https://maps.app.goo.gl/azWyNMcwVWRacECH9',
    },
  ],

  meetSection: {
    labelTop: 'CELEBRATING OUR LOVE',
    title: 'The Couple',
    sectionHeading: 'The Happy Couple',
    bio: "\"A journey of love that began with a beautiful 'Yes'. Together, we are excited to start this new chapter of our lives, hand in hand, forever.\"",
  },

  messageSection: {
    title: 'A Message From Our Hearts',
    paragraph1:
      '"We are both so delighted that you are able to join us in celebrating what we hope will be one of the happiest days of our lives. The affection shown to us by so many people since our roka has been incredibly moving, and has touched us both deeply."',
    paragraph2:
      '"We would like to take this opportunity to thank everyone most sincerely for their kindness. We are looking forward to seeing you at the wedding!"',
    ctaBadge: "CAN'T WAIT TO SEE YOU",
  },

  countdownSection: {
    gettingMarriedText: 'ARE GETTING MARRIED IN',
    message:
      "\"Counting down the moments until we start our journey of forever. We can't wait to celebrate this magical day with you.\"",
  },

  thingsToKnow: {
    labelTop: 'Little Details',
    title: 'Things to Know',
    description:
      'A few thoughtful details to help you enjoy every magical moment of our celebration.',
    surpriseMessage:
      "\"Your presence is the greatest gift of all. We can't wait to see you!\"",
    tips: [
      {
        iconType: 'hashtag',
        title: 'Wedding Hashtag',
        text: 'Capture and share the magic with us! Please use #NwedsN when posting your beautiful moments.',
      },
      {
        iconType: 'map',
        title: 'Digital Map',
        text: 'Easily find your way to our celebrations. Click the location link in the events section for direct navigation.',
      },
    ],
  },

  social: {
    instagramHandle: '@_crewfotos_',
    instagramLink:
      'https://www.instagram.com/_crewfotos_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
    instagramHandle2: '',
    instagramLink2: '',
  },

  footer: {
    credit: 'CREW FOTOS',
  },

  music: {
    src: '/bg-music.mp3',
    volume: 0.7,
  },
};

export default defaultContent;
