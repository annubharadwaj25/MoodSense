import { useNavigate } from "react-router-dom";
import Icon from "./Icon";

function JournalCard() {
    const navigate = useNavigate();

    return (
        <div className="feature-card" onClick={() => navigate("/journal")}>

            <div className="feature-icon">
                <Icon name="journal" size={32} />
            </div>

            <h3>Daily Journal</h3>

            <p>
                Write your daily thoughts, track your emotions,
                and build healthy reflection habits.
            </p>

            <button className="explore-btn">
                Explore
                <Icon name="arrow-right" size={16} />
            </button>

        </div>
    );
}

export default JournalCard;
