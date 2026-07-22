import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import Spinner from "../components/ui/Spinner";
import "./JournalView.css";

function JournalView() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState("");
    const [createdAt, setCreatedAt] = useState(null);
    const [loading, setLoading] = useState(true);

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

        try {
            await api.put(`/api/journal/${id}`, { entry: content });
            setIsEditing(false);
            toast.success("Journal Updated Successfully ✨");
        } catch {
            toast.error("Update Failed");
        }

    };


    const deleteJournal = async () => {
        if (!window.confirm("Delete this journal entry?")) return;

        try {
            await api.delete(`/api/journal/${id}`);
            toast.success("Journal Deleted");
            navigate("/journal");
        } catch {
            toast.error("Failed to delete journal");
        }
    };


    if (loading) {
        return (
            <div className="journal-view-page">
                <Spinner />
            </div>
        );
    }


    return (

        <div className="journal-view-page">

            <div className="journal-container">

                <div className="journal-top">

                    <button
                        className="back-btn"
                        onClick={() => navigate("/journal")}
                    >
                        ← Back
                    </button>

                    <h1>📔 My Journal</h1>

                    <p className="journal-date">
                        {createdAt ? new Date(createdAt).toDateString() : ""}
                    </p>

                    <p>
                        Write, reflect and understand your emotions ✨
                    </p>

                </div>


                <div className="journal-editor">

                    {
                        isEditing ? (

                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />

                        ) : (

                            <div className="journal-content">
                                {content}
                            </div>

                        )
                    }


                    <div className="journal-actions">

                        <button
                            onClick={deleteJournal}
                            className="delete-btn"
                        >
                            🗑️ Delete
                        </button>

                        {
                            isEditing ? (

                                <button
                                    onClick={saveJournal}
                                    className="save-btn"
                                >
                                    💾 Save
                                </button>

                            ) : (

                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="edit-btn"
                                >
                                    ✏️ Edit
                                </button>

                            )
                        }

                    </div>

                </div>

            </div>

        </div>

    );

}

export default JournalView;
