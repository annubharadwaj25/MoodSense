import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/useAuth";

function Navbar() {
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const closeMenu = () => setMenuOpen(false);

    return (
        <nav className="navbar">

            <h2 className="logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                MoodSense
            </h2>

            {/* Hamburger button — visible on mobile */}
            <button
                className="hamburger"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
            >
                <span className={`bar ${menuOpen ? "open" : ""}`} />
                <span className={`bar ${menuOpen ? "open" : ""}`} />
                <span className={`bar ${menuOpen ? "open" : ""}`} />
            </button>

            {/* Navigation links */}
            <div className={`nav-links ${menuOpen ? "nav-open" : ""}`}>

                <Link to="/" onClick={closeMenu}>Home</Link>

                {isAuthenticated ? (
                    <>
                        <Link to="/dashboard" onClick={closeMenu}>Dashboard</Link>
                        <Link to="/detect" onClick={closeMenu}>Detect</Link>
                        <Link to="/journal" onClick={closeMenu}>Journal</Link>
                        <Link to="/history" onClick={closeMenu}>History</Link>
                        <Link to="/profile" onClick={closeMenu}>Profile</Link>
                        <button onClick={() => { handleLogout(); closeMenu(); }}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" onClick={closeMenu}>Login</Link>
                        <Link to="/register" onClick={closeMenu}>Register</Link>
                    </>
                )}

            </div>

        </nav>
    );
}

export default Navbar;
