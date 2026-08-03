import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Spinner from "../components/ui/Spinner";
import "./JournalView.css";

function JournalView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState("");
  const [createdAt, setCreatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchJournal = async () => {
      try {
        const response = await api.get(`/api/journal/view/${id}`);
        setContent(response.data.entry);
        setCreatedAt(response.data.createdAt);
      } catch {
        toast.error("Failed to load journal");
      } finally {
        setLoading(false);
      }
    };

    fetchJournal();
  }, [id]);

  const saveJournal = async () => {
    if (content.trim() === "") {
      toast.error("Journal entry cannot be empty 😊");
      return;
    }

    setSaving(true);
    try {
      await api.put(`/api/journal/${id}`, { entry: content.trim() });
      setIsEditing(false);
      toast.success("Journal updated successfully ✨");
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteJournal = async () => {
    if (!window.confirm("Delete this journal entry?")) return;

    try {
      await api.delete(`/api/journal/${id}`);
      toast.success("Journal deleted");
      navigate("/journal");
    } catch {
      toast.error("Failed to delete journal");
    }
  };

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <>
      <Navbar />
      <main className="journal-view-page">
        <div className="journal-view-container">
          <nav className="journal-view-nav">
            <button
              type="button"
              className="journal-back-btn"
              onClick={() => navigate("/journal")}
            >
              ← Back to Journal
            </button>
          </nav>

          {loading ? (
            <div className="journal-view-loading">
              <Spinner size={32} />
              <span>Loading journal entry...</span>
            </div>
          ) : (
            <article className="journal-view-card">
              <header className="journal-view-header">
                <span className="journal-view-eyebrow">Journal Entry</span>
                <h1 className="journal-view-title">📔 Personal Reflection</h1>
                {formattedDate && (
                  <time className="journal-view-date">{formattedDate}</time>
                )}
              </header>

              <div className="journal-view-body">
                {isEditing ? (
                  <textarea
                    className="journal-view-textarea"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your thoughts..."
                    disabled={saving}
                  />
                ) : (
                  <div className="journal-view-content">{content}</div>
                )}
              </div>

              <footer className="journal-view-actions">
                <button
                  type="button"
                  onClick={deleteJournal}
                  className="journal-btn-delete"
                >
                  🗑️ Delete Entry
                </button>

                {isEditing ? (
                  <button
                    type="button"
                    onClick={saveJournal}
                    className="journal-btn-save"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Spinner size={16} color="var(--white)" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>💾 Save Changes</span>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="journal-btn-edit"
                  >
                    ✏️ Edit Entry
                  </button>
                )}
              </footer>
            </article>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default JournalView;
