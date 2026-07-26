import React, { useMemo } from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { useCountdown } from '../../hooks/useCountdown';
import './CountdownSection.css';
import type { WeddingContent } from '../../content';

interface CountdownSectionProps {
  couple: WeddingContent['couple'];
  countdownSection: WeddingContent['countdownSection'];
  dates: WeddingContent['dates'];
}

const CountdownSection: React.FC<CountdownSectionProps> = ({ couple, countdownSection, dates }) => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  const weddingDate = useMemo(() => new Date(dates.weddingDatetime), [dates.weddingDatetime]);
  const { days, hours, minutes, seconds } = useCountdown(weddingDate);

  const pad = (n: number) => String(n).padStart(2, '0');
  const isCompleted = useMemo(() => weddingDate.getTime() < Date.now(), [weddingDate]);

  return (
    <section className="countdown-section" ref={ref}>
      <div className={`countdown-card ${isVisible ? 'animate-in' : ''}`}>
        <div className="countdown-sparkle-top">✦</div>

        <div className="countdown-names-wrapper">
          <h2 className="countdown-names-script">
            {couple.groomName} &amp; {couple.brideName}
          </h2>
        </div>

        <p className="countdown-getting-married">{countdownSection.gettingMarriedText}</p>

        {isCompleted ? (
          <div className="my-6 p-5 rounded-2xl bg-[#151824]/90 border border-[#38bdf8]/40 shadow-xl backdrop-blur-md">
            <span className="text-xl font-serif text-[#7dd3fc] font-bold block mb-2 tracking-wide">
              🎉 CELEBRATION COMPLETED 🎉
            </span>
            <p className="text-xs text-sky-200/90 leading-relaxed font-sans">
              This wedding celebration has concluded! Thank you to everyone who showered {couple.groomName} &amp; {couple.brideName} with love and blessings.
            </p>
          </div>
        ) : (
          <div className="countdown-timer-magical">
            <div className="time-unit-magical">
              <span className="time-number-glow">{pad(days)}</span>
              <span className="time-label-elegant">DAYS</span>
            </div>
            <span className="time-divider">:</span>
            <div className="time-unit-magical">
              <span className="time-number-glow">{pad(hours)}</span>
              <span className="time-label-elegant">HOURS</span>
            </div>
            <span className="time-divider">:</span>
            <div className="time-unit-magical">
              <span className="time-number-glow">{pad(minutes)}</span>
              <span className="time-label-elegant">MINS</span>
            </div>
            <span className="time-divider">:</span>
            <div className="time-unit-magical">
              <span className="time-number-glow">{pad(seconds)}</span>
              <span className="time-label-elegant">SECS</span>
            </div>
          </div>
        )}

        {!isCompleted && (
          <>
            <div className="countdown-message-wrapper">
              <p className="countdown-message-text">{countdownSection.message}</p>
            </div>
            <div className="countdown-sparkle-bottom">✦</div>
          </>
        )}
      </div>
    </section>
  );
};

export default CountdownSection;
