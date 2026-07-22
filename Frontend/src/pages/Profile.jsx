import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useAuth } from "../context/useAuth";

function Profile() {
  const { user } = useAuth();

  // Get user initials for the avatar
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

        <div className="profile-card">

          <div className="profile-avatar">
            {getInitials(user?.username)}
          </div>

          <h1>{user?.username || "User"}</h1>

          <p className="profile-email">
            {user?.email || "No email"}
          </p>

          <div className="profile-info">

            <div>
              <h3>📔 Journal Entries</h3>
              <p>0 Entries</p>
            </div>

            <div>
              <h3>🧠 Emotions Detected</h3>
              <p>0 Records</p>
            </div>

            <div>
              <h3>📅 Member Since</h3>
              <p>{new Date().getFullYear()}</p>
            </div>

          </div>

        </div>

      </div>
      <Footer />
    </>
  );
}

export default Profile;
