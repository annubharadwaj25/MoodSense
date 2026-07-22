/* eslint-disable react-refresh/only-export-components */
import { createContext } from "react";

// Global auth context — single source of truth for login state.
// Replaces fragile localStorage reads scattered across components.
export const AuthContext = createContext(null);

export default AuthContext;
