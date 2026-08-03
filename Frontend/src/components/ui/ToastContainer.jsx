import { Toaster } from "react-hot-toast";

function ToastContainer() {
    return (
        <Toaster
            position="top-center"
            toastOptions={{
                duration: 3000,
                style: {
                    background: "var(--ink)",
                    color: "var(--cream)",
                    fontSize: "14px",
                    borderRadius: "10px",
                    padding: "12px 18px",
                    fontFamily: "var(--font-sans)",
                    fontWeight: "400",
                },
                success: {
                    style: {
                        background: "var(--success)",
                        color: "var(--white)",
                    },
                },
                error: {
                    style: {
                        background: "var(--error)",
                        color: "var(--white)",
                    },
                },
            }}
        />
    );
}

export default ToastContainer;
