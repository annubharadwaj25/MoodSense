import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import { useTheme } from "../../context/ThemeContext";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const closeMenu = () => setMenuOpen(false);

    const isActive = (path) => {
        if (path === "/") {
            return location.pathname === "/";
        }
        return location.pathname.startsWith(path);
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
        <nav className="navbar">

            <div className="logo" onClick={() => navigate("/")}>
                {/* Premium Custom SVG representing wellness, mindfulness, AI, and mental health */}
                <svg 
                    className="logo-icon" 
                    width="28" 
                    height="28" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Left Hemisphere - Leaf & Emotional Wellness */}
                    <path 
                        d="M12 21.5C8 19.5 5 15.5 5 11C5 6.5 8 4 12 3" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                    />
                    {/* Right Hemisphere - Brain & Cognitive AI Neural Paths */}
                    <path 
                        d="M12 21.5C16 19.5 19 15.5 19 11C19 6.5 16 4 12 3" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                    />
                    {/* Center Lotus / Sprout for Mindfulness & Mental Health */}
                    <path 
                        d="M12 21.5C12 21.5 15 16.5 15 12C15 9.5 13.5 8 12 8C10.5 8 9 9.5 9 12C9 16.5 12 21.5 12 21.5Z" 
                        stroke="var(--sage)" 
                        strokeWidth="1.8" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                    />
                    {/* AI Sparkle / Consciousness Star in Terracotta */}
                    <path 
                        d="M12 1.5L12.8 3L14.3 3.8L12.8 4.6L12 6.1L11.2 4.6L9.7 3.8L11.2 3L12 1.5Z" 
                        fill="var(--terracotta)" 
                    />
                </svg>
                <div className="logo-text">
                    <span className="logo-text-mood">Mood</span>
                    <span className="logo-text-sense">Sense</span>
                </div>
            </div>

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

                <Link to="/" className={isActive("/") ? "active" : ""} onClick={closeMenu}>Home</Link>

                {isAuthenticated ? (
                    <>
                        <Link to="/dashboard" className={isActive("/dashboard") ? "active" : ""} onClick={closeMenu}>Dashboard</Link>
                        <Link to="/detect" className={isActive("/detect") ? "active" : ""} onClick={closeMenu}>Detect</Link>
                        <Link to="/journal" className={isActive("/journal") ? "active" : ""} onClick={closeMenu}>Journal</Link>
                        <Link to="/profile" className={isActive("/profile") ? "active" : ""} onClick={closeMenu}>Profile</Link>
                        <div className="nav-user-avatar">
                            {user?.profilePicture ? (
                                <img src={`http://localhost:5000${user.profilePicture}`} alt="Profile" />
                            ) : (
                                getInitials(user?.username)
                            )}
                        </div>
                        <button 
                            className="theme-toggle-btn" 
                            onClick={() => { toggleTheme(); closeMenu(); }}
                            aria-label="Toggle theme"
                        >
                            {theme === "light" ? "🌙" : "☀️"}
                        </button>
                        <button className="logout-btn" onClick={() => { handleLogout(); closeMenu(); }}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className={isActive("/login") ? "active" : ""} onClick={closeMenu}>Sign in</Link>
                        <Link to="/register" onClick={closeMenu}>
                            <button className="get-started-btn">Get started</button>
                        </Link>
                    </>
                )}

            </div>

        </nav>
    );
}

export default Navbar;
