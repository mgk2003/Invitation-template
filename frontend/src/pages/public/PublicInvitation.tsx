import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGetPublicInvitationQuery } from '../../store/services/invitationApi';
import LuxuryLoader from '../../components/loader/LuxuryLoader';

import DesktopBackground from '../../components/template/DesktopBackground';
import HeroSection from '../../components/template/HeroSection';
import CeremonySpacer from '../../components/template/CeremonySpacer';
import InviteCard from '../../components/template/InviteCard';
import EventsSection from '../../components/template/EventsSection';
import MeetSection from '../../components/template/MeetSection';
import MessageSection from '../../components/template/MessageSection';
import ThingsToKnow from '../../components/template/ThingsToKnow';
import CountdownSection from '../../components/template/CountdownSection';
import Footer from '../../components/template/Footer';
import MusicPlayer from '../../components/template/MusicPlayer';
import ScrollIndicator from '../../components/template/ScrollIndicator';

export const PublicInvitation: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: content, isLoading, isError } = useGetPublicInvitationQuery(slug || '', {
    skip: !slug,
  });

  if (isLoading) {
    return <LuxuryLoader tip="Preparing Your Wedding Experience..." fullScreen={true} />;
  }

  if (isError || !content) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-6 text-center relative overflow-hidden">
        {/* Ornate Background Orbs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md bg-[#121318] border border-[#d4af37]/30 p-8 rounded-3xl shadow-2xl backdrop-blur-md relative z-10"
        >
          <div className="w-20 h-20 bg-gradient-to-tr from-[#8b6508] to-[#f3e5ab] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-lg">
            💍
          </div>
          <h1 className="font-serif text-2xl text-[#f3e5ab] font-bold tracking-wider mb-3">
            Invitation Not Available
          </h1>
          <p className="text-sm text-gray-300 mb-6 leading-relaxed">
            The requested wedding invitation is currently inactive, expired, draft, or does not exist.
          </p>
          <div className="text-xs text-[#d4af37]/60 font-mono bg-amber-500/5 p-3 rounded-xl border border-amber-500/20">
            URL Slug: /{slug}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Luxury Desktop Background */}
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
          <Footer footer={content.footer} couple={content.couple} />
        </div>
        <ScrollIndicator />
      </div>
    </div>
  );
};

export default PublicInvitation;
