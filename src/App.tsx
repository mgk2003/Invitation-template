import './App.css';
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

function App() {
  return (
    <div className="app-wrapper">
      <MusicPlayer />
      {/* Content scrolls over background */}
      <div className="app-content">
        <HeroSection />
        <CeremonySpacer />
        <InviteCard />
        <EventsSection />
        <MeetSection />
        <MessageSection />
        <ThingsToKnow />
        <CountdownSection targetDate="2026-07-06T06:15:00" />
        <Footer />
      </div>
      <ScrollIndicator />
    </div>
  );
}

export default App;
