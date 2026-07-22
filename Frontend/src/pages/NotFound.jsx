import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-emoji">🧭</div>
        <h1 className="not-found-code">404</h1>
        <h2>Page Not Found</h2>
        <p>
          Oops! The page you're looking for seems to have wandered off.
          Let's get you back on track.
        </p>
        <Link to="/" className="not-found-btn">
          🏠 Back to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
