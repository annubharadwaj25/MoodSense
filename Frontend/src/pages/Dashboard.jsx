import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useAuth } from "../context/useAuth";

function Dashboard() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <div className="dashboard-page">

        <h1>📊 Emotion Dashboard</h1>

        <p>
          Welcome back, {user?.username || "User"}! Track your emotional wellness.
        </p>

        <div className="dashboard-cards">

          <div className="dashboard-card">
            <div className="emoji">😊</div>
            <h2>Current Mood</h2>
            <p>Happy</p>
          </div>

          <div className="dashboard-card">
            <div className="emoji">📔</div>
            <h2>Journal Entries</h2>
            <p>12 Entries</p>
          </div>

          <div className="dashboard-card">
            <div className="emoji">🧠</div>
            <h2>Emotions Detected</h2>
            <p>25 Records</p>
          </div>

        </div>

      </div>
      <Footer />
    </>
  );
}

export default Dashboard;
