import './App.css';
import DesktopBackground from './components/DesktopBackground';
import HeroSection from './components/HeroSection';
import CeremonySpacer from './components/CeremonySpacer';
import InviteCard from './components/InviteCard';
import EventsSection from './components/EventsSection';
import MeetSection from './components/MeetSection';
import MessageSection from './components/MessageSection';
import ThingsToKnow from './components/ThingsToKnow';
import CountdownSection from './components/CountdownSection';
import Footer from './components/Footer';
import MusicPlayer from './components/MusicPlayer';
import ScrollIndicator from './components/ScrollIndicator';

// ─── Single import point for all content ─────────────────────
import content from './content';

function App() {
  return (
    <div className="app-container">
      {/* Dynamic luxury background for desktop screens */}
      <DesktopBackground />

      {/* Main invitation mobile mockup frame */}
      <div className="app-wrapper">
        <div className="desktop-phone-notch" />
        <MusicPlayer music={content.music} />

        {/* Content scrolls over background */}
        <div className="app-content">
          <HeroSection
            couple={content.couple}
            hero={content.hero}
            dates={content.dates}
          />
          <CeremonySpacer />
          <InviteCard
            couple={content.couple}
            inviteCard={content.inviteCard}
            dates={content.dates}
          />
          <EventsSection events={content.events} />
          <MeetSection
            couple={content.couple}
            meetSection={content.meetSection}
          />
          <MessageSection
            couple={content.couple}
            messageSection={content.messageSection}
          />
          <ThingsToKnow
            thingsToKnow={content.thingsToKnow}
            social={content.social}
          />
          <CountdownSection
            couple={content.couple}
            countdownSection={content.countdownSection}
            dates={content.dates}
          />
          <Footer footer={content.footer} />
        </div>
        <ScrollIndicator />
      </div>
    </div>
  );
}

export default App;
