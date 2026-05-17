import React from 'react';
import EventCard from './EventCard';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import './EventsSection.css';

const MAP_LINK = 'https://maps.app.goo.gl/KVPCU4LGSqfw5PUUA';
const VENUE_NAME = 'Sri Ram Mahal A/C';
const VENUE_ADDRESS = 'Kulamangalam Main Road, Opp. C.E.O.A. School, Kosakulam, Madurai';

const events = [
  {
    title: 'Engagement',
    date: 'Sunday, July 5th 2026',
    venue: `${VENUE_NAME}, ${VENUE_ADDRESS}`,
    time: '6:00 PM Onwards',
    mapLink: MAP_LINK
  },
  {
    title: 'Wedding',
    date: 'Monday, July 6th 2026',
    venue: 'Arulmigu Subramaniya Swami Temple, Tirupparankundram',
    time: '6.15 a.m to 7.15 a.m',
    mapLink: 'https://maps.app.goo.gl/azWyNMcwVWRacECH9'
  },
];

const EventsSection: React.FC = () => {
  const { ref, isVisible } = useScrollAnimation(0.05);

  return (
    <section className="events-section" ref={ref}>
      <div className={`events-header ${isVisible ? 'animate-in' : ''}`}>
        <p className="events-label">The Celebrations</p>
        <h2 className="events-main-title">Events</h2>
        <div className="events-header-line" />
      </div>

      <div className="events-list">
        {events.map((event, i) => (
          <EventCard
            key={event.title}
            title={event.title}
            date={event.date}
            venue={event.venue}
            time={event.time}
            mapLink={event.mapLink}
            delay={i * 200}
            isLast={i === events.length - 1}
          />
        ))}
      </div>
    </section>
  );
};

export default EventsSection;
