import { useNavigate } from "react-router-dom";
import Icon from "./Icon";

function EmotionCard() {
    const navigate = useNavigate();

    return (
        <div className="feature-card" onClick={() => navigate("/detect")}>

            <div className="feature-icon">
                <Icon name="brain" size={32} />
            </div>

            <h3>Mood Reflection</h3>

            <p>
                Reflect on your emotions using our AI-powered
                emotional understanding system.
            </p>

            <button className="explore-btn">
                Explore
                <Icon name="arrow-right" size={16} />
            </button>

        </div>
    );
}

export default EmotionCard;
