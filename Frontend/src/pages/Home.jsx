import Navbar from "../components/layout/Navbar";
import Hero from "../components/ui/Hero";
import EmotionCard from "../components/ui/EmotionCard";
import JournalCard from "../components/ui/JournalCard";
import SuggestionCard from "../components/ui/SuggestionCard";
import Footer from "../components/layout/Footer";
import HowItWorks from "../components/ui/HowItWorks";
import Stats from "../components/ui/Stats";

function Home() {
  return (
    <>
      <Navbar />

      <Hero />

      {/* Features — Bento Grid */}
      <section className="features">
        <div className="section">
          <span className="section-eyebrow">Why MoodSense</span>
          <h2 className="section-heading">
            Everything you need to <em>understand</em> yourself
          </h2>
          <p className="section-subtitle">
            Notice, name, and nurture your emotional wellbeing — all in one calm place.
          </p>

          <div className="cards-section">
            <EmotionCard />
            <JournalCard />
            <SuggestionCard />
          </div>
        </div>
      </section>

      <HowItWorks />

      <Stats />

      <Footer />
    </>
  );
}

export default Home;