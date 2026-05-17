import React from 'react';
import EventCard from './EventCard';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import './EventsSection.css';
import type { EventItem } from '../content';

interface EventsSectionProps {
  events: EventItem[];
}

const EventsSection: React.FC<EventsSectionProps> = ({ events }) => {
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
