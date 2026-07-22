import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import Spinner from "../components/ui/Spinner";
import "./Journal.css";

function Journal() {

  const navigate = useNavigate();
  const [entry, setEntry] = useState("");
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJournals = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await api.get(`/api/journal/${user.id}`);
      setJournals(response.data);
    } catch {
      toast.error("Failed to load journals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchJournals();
  }, []);

  const saveJournal = async () => {
    if (entry.trim() === "") {
      toast.error("Please write something first 😊");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await api.post("/api/journal", {
        userId: user.id,
        entry: entry,
      });

      toast.success(response.data.message);
      setJournals([response.data.journal, ...journals]);
      setEntry("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save journal");
    }
  };

  const deleteJournal = async (journalId, e) => {
    e.stopPropagation(); // don't trigger navigation
    if (!window.confirm("Delete this journal entry?")) return;

    try {
      await api.delete(`/api/journal/${journalId}`);
      toast.success("Journal deleted");
      setJournals(journals.filter((j) => j._id !== journalId));
    } catch {
      toast.error("Failed to delete journal");
    }
  };

  return (

    <div className="journal-page">

      <div className="journal-header">

        <h1>📔 Daily Journal</h1>

        <p>
          Capture your thoughts, emotions and memories every day.
        </p>

      </div>

      <div className="journal-layout">

        {/* LEFT — Previous Entries */}
        <div className="journal-sidebar">

          <h2>📅 Previous Entries</h2>

          {loading ? (
            <Spinner />
          ) : journals.length === 0 ? (

            <div className="empty-journal">
              <p>No journal entries yet ✨</p>
            </div>

          ) : (

            journals.map((journal) => (
              <div
                key={journal._id}
                className="journal-card"
                onClick={() => navigate(`/journal/${journal._id}`)}
              >

                <h4>
                  {new Date(journal.createdAt).toDateString()}
                </h4>

                <p className="journal-preview">
                  {journal.entry.length > 80
                    ? journal.entry.substring(0, 80) + "..."
                    : journal.entry}
                </p>

                <button
                  className="journal-delete-btn"
                  onClick={(e) => deleteJournal(journal._id, e)}
                  title="Delete journal"
                >
                  🗑️
                </button>

              </div>
            ))

          )}

        </div>

        {/* RIGHT — Editor */}
        <div className="journal-editor">

          <h2>✍️ Today's Journal</h2>

          <textarea
            placeholder="How are you feeling today?"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            maxLength={1000}
          />

          <p className="character-count">
            {entry.length}/1000 characters
          </p>

          <button onClick={saveJournal}>
            💾 Save Entry
          </button>

        </div>

      </div>

    </div>

  );

}

export default Journal;
