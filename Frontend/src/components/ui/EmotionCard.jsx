import { useNavigate } from "react-router-dom";

function EmotionCard() {
    const navigate = useNavigate();

    return (
        <div className="feature-card">

            <div className="feature-icon">
                😊
            </div>

            <h3>Emotion Detection</h3>

            <p>
                Detect your emotions instantly using our AI-powered emotion
                recognition system.
            </p>

            <button
                className="explore-btn"
                onClick={() => navigate("/detect")}
            >
                Explore →
            </button>

        </div>
    );
}

export default EmotionCard;