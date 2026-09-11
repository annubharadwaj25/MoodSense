import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Spinner from "../components/ui/Spinner";
import { useAuth } from "../context/useAuth";
import api from "../services/api";

function History() {
  const { user } = useAuth();
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return undefined;

    let cancelled = false;

    const loadHistory = async () => {
      try {
        const response = await api.get(`/api/journal/${user.id}`);
        if (!cancelled) setHistoryData(response.data);
      } catch {
        if (!cancelled) toast.error("Failed to load emotion history");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadHistory();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return (
    <>
      <Navbar />
      <div className="history-page">
        <h1>Emotion History</h1>
        <p>View your previous emotion records and journal activities.</p>

        <div className="history-container">
          {loading ? (
            <Spinner size={28} />
          ) : historyData.length === 0 ? (
            <p>No emotion history yet. Your journal reflections will appear here.</p>
          ) : (
            historyData.map((item) => (
              <div className="history-card" key={item._id}>
                <h2>{item.emotion || "Neutral"}</h2>
                <h3>{new Date(item.createdAt).toLocaleDateString()}</h3>
                <p>{item.entry}</p>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default History;
