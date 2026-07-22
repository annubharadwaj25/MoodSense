import { useNavigate } from "react-router-dom";

function JournalCard() {
    const navigate = useNavigate();

    return (
        <div className="feature-card">

            <div className="feature-icon">
                📔
            </div>

            <h3>Daily Journal</h3>

            <p>
                Write your daily thoughts, track your emotions,
                and build healthy reflection habits.
            </p>

            <button
                className="explore-btn"
                onClick={() => navigate("/journal")}
            >
                Explore →
            </button>

        </div>
    );
}

export default JournalCard;