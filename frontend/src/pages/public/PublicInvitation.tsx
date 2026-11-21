import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtom } from 'jotai';
import { isDateRevealOpenAtom } from '../../atoms';
import { useGetPublicInvitationQuery } from '../../store/services/invitationApi';
import { supabase } from '../../lib/supabase';
import LuxuryLoader from '../../components/loader/LuxuryLoader';
import { getBackgroundImageUrl } from '../../types/wedding';

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
import RoyalEnvelope from '../../components/template/RoyalEnvelope';
import BlessingReaction from '../../components/template/BlessingReaction';

export const PublicInvitation: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';

  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [isDateRevealOpen] = useAtom(isDateRevealOpenAtom);

  const { data: content, isLoading, isError } = useGetPublicInvitationQuery(
    { slug: slug || '', preview: isPreview },
    { skip: !slug }
  );

  // Efficient & deduplicated visitor views tracking
  useEffect(() => {
    if (!slug || isPreview || !content) return;

    const formattedSlug = slug.toLowerCase().trim();
    const storageKey = `wedding_viewed_${formattedSlug}`;
    const lastViewed = localStorage.getItem(storageKey);
    const now = Date.now();
    const COOLDOWN_MS = 10 * 60 * 1000; // 10-minute visitor cooldown window

    // If already viewed in the last 10 minutes on this browser, do not increment on refresh
    if (lastViewed && now - parseInt(lastViewed, 10) < COOLDOWN_MS) {
      return;
    }

    // Do not count visits from logged-in administrators testing their own links
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        return;
      }

      // Mark as viewed on this device
      localStorage.setItem(storageKey, String(now));

      // Asynchronously increment atomic views in database
      supabase.rpc('increment_invitation_views', { p_slug: formattedSlug }).then();
    });
  }, [slug, isPreview, Boolean(content)]);

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
      {/* 1. Standout Royal Wax Seal Envelope Opening Ceremony */}
      <AnimatePresence>
        {!envelopeOpened && (
          <RoyalEnvelope
            couple={content.couple}
            dates={content.dates}
            onOpen={() => setEnvelopeOpened(true)}
          />
        )}
      </AnimatePresence>

      {/* Luxury Desktop Background */}
      <DesktopBackground backgroundImage={content.backgroundImage} />

      {/* Main invitation mobile mockup frame */}
      <div
        className="app-wrapper"
        style={{ backgroundImage: `url(${getBackgroundImageUrl(content.backgroundImage)})` }}
      >
        <div className="desktop-phone-notch" />
        <MusicPlayer music={content.music} />

        {/* Re-open Envelope Button (Symmetrically aligned with Music Player) */}
        {envelopeOpened && !isDateRevealOpen && (
          <div className="envelope-reopen-fixed">
            <button
              type="button"
              onClick={() => setEnvelopeOpened(false)}
              className="envelope-reopen-btn"
              title="Re-open Royal Envelope"
            >
              <span>💌</span>
            </button>
          </div>
        )}

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
        {!isDateRevealOpen && <ScrollIndicator />}

        {/* 2. Standout Interactive Guest Wishes & Du'a Burst */}
        {envelopeOpened && !isDateRevealOpen && (
          <BlessingReaction
            slug={slug || ''}
            initialCount={content?.wishesCount || 0}
          />
        )}
      </div>
    </div>
  );
};

export default PublicInvitation;
