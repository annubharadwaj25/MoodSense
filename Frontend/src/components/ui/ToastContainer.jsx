import { Toaster } from "react-hot-toast";

// Place once in App.jsx — provides toast notifications globally.
// Usage anywhere: import toast from "react-hot-toast"; toast.success("msg");
function ToastContainer() {
    return (
        <Toaster
            position="top-center"
            toastOptions={{
                duration: 3000,
                style: {
                    background: "#333",
                    color: "#fff",
                    fontSize: "15px",
                    borderRadius: "12px",
                    padding: "14px 20px",
                },
                success: {
                    style: {
                        background: "#22c55e",
                    },
                },
                error: {
                    style: {
                        background: "#ef4444",
                    },
                },
            }}
        />
    );
}

export default ToastContainer;
