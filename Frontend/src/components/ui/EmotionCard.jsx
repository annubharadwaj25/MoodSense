import { useNavigate } from "react-router-dom";
import Icon from "./Icon";

function EmotionCard() {
    const navigate = useNavigate();

    return (
        <div className="feature-card" onClick={() => navigate("/detect")}>

            <div className="feature-icon">
                <Icon name="brain" size={32} />
            </div>

            <h3>Emotion Detection</h3>

            <p>
                Detect your emotions instantly using our AI-powered
                emotion recognition system.
            </p>

            <button className="explore-btn">
                Explore
                <Icon name="arrow-right" size={16} />
            </button>

        </div>
    );
}

export default EmotionCard;
