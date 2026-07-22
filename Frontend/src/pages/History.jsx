import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

function History() {

  const historyData = [
    {
      date: "15 July 2026",
      emotion: "😊 Happy",
      note: "Had a productive day"
    },
    {
      date: "14 July 2026",
      emotion: "😔 Sad",
      note: "Feeling a little low"
    },
    {
      date: "13 July 2026",
      emotion: "😌 Calm",
      note: "Relaxing and peaceful day"
    }
  ];

  return (
    <>
      <Navbar />
      <div className="history-page">

        <h1>📜 Emotion History</h1>

        <p>
          View your previous emotion records and journal activities.
        </p>

        <div className="history-container">

          {historyData.map((item, index) => (
            <div className="history-card" key={index}>

              <h2>{item.emotion}</h2>

              <h3>{item.date}</h3>

              <p>{item.note}</p>

            </div>
          ))}

        </div>

      </div>
      <Footer />
    </>
  );
}

export default History;
