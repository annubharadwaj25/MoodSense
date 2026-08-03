import { useNavigate } from "react-router-dom";
import Icon from "./Icon";

function SuggestionCard() {
    const navigate = useNavigate();

    return (
        <div className="feature-card" onClick={() => navigate("/detect")}>

            <div className="feature-icon">
                <Icon name="lightbulb" size={32} />
            </div>

            <h3>Personalized Guidance</h3>

            <p>
                Receive thoughtful AI-powered wellness guidance
                based on your emotional state.
            </p>

            <button className="explore-btn">
                Explore
                <Icon name="arrow-right" size={16} />
            </button>

        </div>
    );
}

export default SuggestionCard;
