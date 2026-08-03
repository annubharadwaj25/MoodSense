import { useState, useMemo } from "react";
import { AuthContext } from "./AuthContext";

// Read initial auth state from localStorage synchronously (no effect needed)
const getInitialAuth = () => {
    try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        const isLoggedIn = localStorage.getItem("isLoggedIn");

        if (storedToken && storedUser && isLoggedIn === "true") {
            return {
                token: storedToken,
                user: JSON.parse(storedUser),
            };
        }
    } catch (err) {
        console.error("Failed to hydrate auth state:", err);
    }
    return { token: null, user: null };
};

export const AuthProvider = ({ children }) => {
    const initial = getInitialAuth();
    const [user, setUser] = useState(initial.user);
    const [token, setToken] = useState(initial.token);

    // Called after a successful login
    const login = (newToken, newUser) => {
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(newUser));
        localStorage.setItem("isLoggedIn", "true");
        setToken(newToken);
        setUser(newUser);
    };

    // Called on logout
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("isLoggedIn");
        setToken(null);
        setUser(null);
    };

    const value = useMemo(
        () => ({
            user,
            token,
            isAuthenticated: !!token,
            login,
            logout,
            setUser,
        }),
        [user, token]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
