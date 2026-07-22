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

      {/* Features */}
      <section className="features">

        <div className="features-heading">
          <h2>Why Choose MoodSense?</h2>

          <p>
            Everything you need to understand, track and improve
            your emotional well-being.
          </p>
        </div>

        <div className="cards-section">
          <EmotionCard />
          <JournalCard />
          <SuggestionCard />
        </div>

      </section>

      {/* New Section */}
      <HowItWorks />

      {/* New Section */}
      <Stats />

      <Footer />
    </>
  );
}
export default Home;