import { useNavigate } from "react-router-dom";

function SuggestionCard() {
    const navigate = useNavigate();

    return (
        <div className="feature-card">

            <div className="feature-icon">
                💡
            </div>

            <h3>Smart Suggestions</h3>

            <p>
                Receive personalized AI-powered wellness tips
                based on your emotional state.
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

export default SuggestionCard;