function Spinner({ size = 32, color = "var(--sage)" }) {
    return (
        <div className="spinner-wrapper">
            <div
                className="spinner"
                style={{
                    width: size,
                    height: size,
                    borderColor: `${color}30`,
                    borderTopColor: color,
                }}
            />
        </div>
    );
}

export default Spinner;
