// Reusable Icon component — references symbols from /public/icons.svg sprite.
// Usage: <Icon name="brain" size={24} className="my-icon" />
function Icon({ name, size = 24, className = "" }) {
    return (
        <svg
            className={`icon ${className}`}
            width={size}
            height={size}
            aria-hidden="true"
            focusable="false"
        >
            <use href={`/icons.svg#icon-${name}`} />
        </svg>
    );
}

export default Icon;
