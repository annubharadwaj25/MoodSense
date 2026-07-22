import { useNavigate } from "react-router-dom";

function Hero() {
    const navigate = useNavigate();

    return (
        <section className="hero">

            <div className="hero-left">

                <span className="hero-badge">
                    🧠 AI Powered Mental Wellness
                </span>

                <h1>
                    Understand Your
                    <span> Emotions </span>
                    with AI
                </h1>

                <p>
                    Detect your emotions, write daily journals,
                    receive smart AI suggestions, and track your
                    emotional wellness journey—all in one place.
                </p>

                <div className="hero-buttons">

                    <button
                        className="hero-btn"
                        onClick={() => navigate("/detect")}
                    >
                        🧠 Detect Emotion
                    </button>

                    <button
                        className="hero-btn-outline"
                        onClick={() => navigate("/journal")}
                    >
                        📔 Write Journal
                    </button>

                </div>

            </div>

            <div className="hero-right">

                <div className="hero-circle">
                    😊
                </div>

                <div className="floating-card card1">
                    💜 AI Analysis
                </div>

                <div className="floating-card card2">
                    📔 Daily Journal
                </div>

                <div className="floating-card card3">
                    💡 Smart Tips
                </div>

            </div>

        </section>
    );
}

export default Hero;