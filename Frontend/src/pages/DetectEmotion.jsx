import { useState } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

function DetectEmotion() {
  const [text, setText] = useState("");
  const [emotion, setEmotion] = useState("");

  const detectEmotion = () => {
    if (text.trim() === "") {
      setEmotion("Please enter your thoughts first 😊");
    } else {
      setEmotion("Happy 😊 (Demo Result)");
    }
  };

  return (
    <>
      <Navbar />
      <div className="detect-page">
        <h1>🧠 Detect Your Emotion</h1>

        <p>
          Write your thoughts and our system will analyze your emotion.
        </p>

        <textarea
          placeholder="How are you feeling today?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button onClick={detectEmotion}>
          Analyze Emotion
        </button>

        {emotion && (
          <div className="emotion-result">
            <h2>Result:</h2>
            <p>{emotion}</p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default DetectEmotion;
