// Public landing page (served at `/`).
//
// Composes every design-spec section in the order specified by the
// public landing page plan: Hero, About IEB Election, About AEB,
// Meet Our Election Panel, Manifesto, Why Vote, President's Message,
// News, Gallery, Contact.

import HeroSection from "../components/public/HeroSection";
import AboutElectionSection from "../components/public/AboutElectionSection";
import AboutAebSection from "../components/public/AboutAebSection";
import ElectionPanelSection from "../components/public/ElectionPanelSection";
import ManifestoSection from "../components/public/ManifestoSection";
import WhyVoteSection from "../components/public/WhyVoteSection";
import PresidentMessageSection from "../components/public/PresidentMessageSection";
import NewsSection from "../components/public/NewsSection";
import GallerySection from "../components/public/GallerySection";
import ContactSection from "../components/public/ContactSection";

export default function PublicLandingPage() {
  return (
    <>
      <HeroSection />
      <AboutElectionSection />
      <AboutAebSection />
      <ElectionPanelSection />
      <ManifestoSection />
      <WhyVoteSection />
      <PresidentMessageSection />
      <NewsSection />
      <GallerySection />
      <ContactSection />
    </>
  );
}
