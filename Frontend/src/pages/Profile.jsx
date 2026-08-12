import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import api from "../services/api";
import toast from "react-hot-toast";
import EditProfileModal from "../components/profile/EditProfileModal";
import "./Profile.css";

const EMOJI_MAP = {
  Happy: "😊",
  Sad: "😔",
  Calm: "😌",
  Angry: "😠",
  Anxious: "😟",
  Excited: "🤩",
  Neutral: "😐",
  Stressed: "😣",
  Fear: "😨",
};

function Profile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  
  // Dashboard stats
  const [stats, setStats] = useState({
    journalCount: 0,
    emotionCount: 0,
    memberSince: new Date().getFullYear(),
    emotionDistribution: [],
  });
  
  // Emotion history data
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
      fetchEmotionHistory();
      fetchConversations();
    }
  }, [user]);

  async function fetchDashboardStats() {
    try {
      const response = await api.get("/api/dashboard");
      setStats(prev => ({
        ...prev,
        journalCount: response.data.journalCount,
        emotionCount: response.data.emotionDistribution.reduce((sum, item) => sum + item.count, 0),
        emotionDistribution: response.data.emotionDistribution,
      }));
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    }
  };

  async function fetchEmotionHistory() {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) return;
      const response = await api.get(`/api/journal/${user.id}`);
      const journalsWithEmotion = response.data.filter(j => j.emotion);
      setEmotionHistory(journalsWithEmotion.slice(0, 10));
    } catch (err) {
      console.error("Failed to fetch emotion history:", err);
    }
  };

  async function fetchConversations() {
    try {
      const response = await api.get("/api/conversations");
      setConversations(response.data.slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const getInitials = (name) => {
    if (!name) return "👤";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <Navbar />
      <div className="profile-page">
        <div className="profile-container">
          
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar-large">
                {user?.profilePicture ? (
                  <img src={`http://localhost:5000${user.profilePicture}`} alt="Profilepicture" />
                ) : (
                  getInitials(user?.username)
                )}
              </div>
              <div className="profile-info">
                <h1>{user?.username || "User"}</h1>
                <p className="profile-email">{user?.email || "No email"}</p>
                <button className="profile-btn profile-btn-edit" onClick={() => setIsModalOpen(true)}>
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Edit Profile Modal */}
          <EditProfileModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            user={user}
            onUpdate={handleProfileUpdate}
          />

          {/* Dashboard Stats */}
          <div className="profile-dashboard">
            <h2 className="profile-section-title">Dashboard Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📔</div>
                <div className="stat-content">
                  <h3>Journal Entries</h3>
                  <p className="stat-value">{stats.journalCount}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🧠</div>
                <div className="stat-content">
                  <h3>Emotions Detected</h3>
                  <p className="stat-value">{stats.emotionCount}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-content">
                  <h3>Member Since</h3>
                  <p className="stat-value">{stats.memberSince}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💬</div>
                <div className="stat-content">
                  <h3>Conversations</h3>
                  <p className="stat-value">{conversations.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Emotion History Section */}
          <div className="profile-history">
            <h2 className="profile-section-title">Emotion History</h2>
            
            {/* Recent Emotions */}
            <div className="history-section">
              <h3>Recent Detected Emotions</h3>
              <div className="emotion-timeline">
                {emotionHistory.length > 0 ? (
                  emotionHistory.map((journal) => (
                    <div key={journal._id} className="timeline-row">
                      <div className="timeline-card">
                        <div className="timeline-date">
                          {new Date(journal.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="timeline-emotion">
                          {EMOJI_MAP[journal.emotion] || "✨"} {journal.emotion}
                        </div>
                      </div>
                      <button 
                        className="timeline-view-btn"
                        onClick={() => navigate(`/journal/${journal._id}`)}
                        aria-label="View journal"
                      >
                        👁
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">No emotion history yet</p>
                )}
              </div>
            </div>

            {/* Emotion Distribution */}
            <div className="history-section">
              <h3>Emotion Distribution</h3>
              <div className="emotion-distribution">
                {stats.emotionDistribution.length > 0 ? (
                  stats.emotionDistribution.map((item, index) => (
                    <div key={index} className="emotion-bar">
                      <div className="emotion-label">
                        {EMOJI_MAP[item.emotion] || "✨"} {item.emotion}
                      </div>
                      <div className="emotion-bar-fill">
                        <div 
                          className="emotion-bar-progress"
                          style={{ width: `${(item.count / stats.emotionCount) * 100}%` }}
                        />
                      </div>
                      <div className="emotion-count">{item.count}</div>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">No emotion data yet</p>
                )}
              </div>
            </div>

            {/* Recent Conversations */}
            <div className="history-section">
              <h3>Recent Conversations</h3>
              <div className="conversation-list">
                {conversations.length > 0 ? (
                  conversations.map((conv) => (
                    <div key={conv._id} className="conversation-item">
                      <div className="conversation-date">
                        {new Date(conv.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div className="conversation-emotion">
                        {EMOJI_MAP[conv.emotion] || "✨"} {conv.emotion || "Neutral"}
                      </div>
                      <div className="conversation-messages">
                        {conv.messages?.length || 0} messages
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">No saved conversations yet</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}

export default Profile;
