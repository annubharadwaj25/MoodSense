import { useNavigate } from "react-router-dom";
import Icon from "./Icon";

function Hero() {
    const navigate = useNavigate();

    return (
        <section className="hero">

            <div className="hero-left">

                <span className="hero-badge">
                    <Icon name="brain" size={15} />
                    AI-powered mental wellness
                </span>

                <h1>
                    Notice how you <em>feel</em>,<br />one entry at a time.
                </h1>

                <p>
                    A quiet space to reflect on your emotions, write daily journals,
                    and receive thoughtful guidance for your wellbeing —
                    all in one calm place.
                </p>

                <div className="hero-buttons">

                    <button className="hero-btn" onClick={() => navigate("/detect")}>
                        <Icon name="brain" size={18} />
                        Reflect
                    </button>

                    <button className="hero-btn" onClick={() => navigate("/journal")}>
                        <Icon name="journal" size={18} />
                        Write journal
                    </button>

                </div>

            </div>

            <div className="hero-right">

                <div className="hero-orb">
                    <div className="hero-orb-inner">
                        <span className="mood-value">72°</span>
                        <span className="mood-label">Calm today</span>
                    </div>

                    <div className="floating-card card1">
                        <Icon name="spark" size={20} />
                        Mood Insights
                    </div>

                    <div className="floating-card card2">
                        <Icon name="journal" size={20} />
                        Daily Journal
                    </div>

                    <div className="floating-card card3">
                        <Icon name="lightbulb" size={20} />
                        Smart Tips
                    </div>
                </div>

            </div>

        </section>
    );
}

export default Hero;
