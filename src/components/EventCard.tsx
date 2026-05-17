import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import './EventCard.css';

interface EventCardProps {
  title: string;
  date: string;
  venue: string;
  time: string;
  mapLink?: string;
  delay?: number;
  isLast?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ title, date, venue, time, mapLink = '#', delay = 0, isLast = false }) => {
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <div
      className={`event-card-magical ${isVisible ? 'animate-in' : ''}`}
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="event-sparkle-top">✦</div>

      <div className="event-content">
        <h3 className="event-title-cinzel">{title}</h3>
        <div className="event-info-divider"></div>
        <p className="event-date-text">{date}</p>
        <p className="event-time-text">{time}</p>
        <p className="event-venue-text">{venue}</p>

        <a href={mapLink} className="event-map-btn" target="_blank" rel="noopener noreferrer">
          VIEW LOCATION
        </a>
      </div>

      {isLast && <div className="event-sparkle-bottom">✦</div>}
    </div>
  );
};

export default EventCard;
