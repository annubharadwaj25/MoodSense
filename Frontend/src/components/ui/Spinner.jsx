function Spinner({ size = 40, color = "#6C63FF" }) {
    return (
        <div className="spinner-wrapper">
            <div
                className="spinner"
                style={{
                    width: size,
                    height: size,
                    borderColor: `${color}20`,
                    borderTopColor: color,
                }}
            />
        </div>
    );
}

export default Spinner;
