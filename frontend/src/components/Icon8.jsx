import { useState, memo } from "react";

/**
 * Base Icons8 Icon Component
 *
 * @param {string} name - Icon name (e.g., 'heart', 'star', 'search')
 * @param {number} size - Icon size in pixels (default: 96)
 * @param {string} color - Hex color without # (default: '000000' for black)
 * @param {string} style - Icon style: 'color', 'fluency', 'flat', '3d', 'ios', 'android' (default: 'color')
 * @param {string} alt - Alt text for accessibility (REQUIRED)
 * @param {string} fallback - Fallback character if image fails to load (default: '●')
 * @param {function} onError - Custom error handler
 * @param {boolean} lazy - Enable lazy loading (default: true)
 * @param {string} className - Optional class name for styling
 * @param {string} loading - Override native loading attribute
 */
export function Icon8({
  name,
  size = 96,
  color = "000000",
  style = "color",
  alt = "",
  fallback = "●",
  onError = null,
  lazy = true,
  className = "",
  loading = "lazy",
}) {
  const [hasError, setHasError] = useState(false);

  if (!name) {
    console.warn("Icon8: name prop is required");
    return null;
  }

  if (!alt) {
    console.warn(`Icon8: alt prop is recommended for icon "${name}"`);
  }

  const iconUrl = `https://img.icons8.com/${style}/${size}/${color}/${name}.png`;

  const handleError = (error) => {
    setHasError(true);
    console.warn(`Icon8: Failed to load icon "${name}" from URL: ${iconUrl}`);
    if (onError) onError(error);
  };

  if (hasError) {
    return (
      <span
        role="img"
        aria-label={alt || name}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: `${size}px`,
          height: `${size}px`,
          fontSize: `${size * 0.6}px`,
          color: `#${color}`,
          backgroundColor: "#f0f0f0",
          borderRadius: "4px",
        }}
        title={alt || name}
      >
        {fallback}
      </span>
    );
  }

  return (
    <img
      src={iconUrl}
      alt={alt || name}
      width={size}
      height={size}
      onError={handleError}
      role="img"
      className={className}
      loading={lazy ? "lazy" : loading}
      style={{
        display: "inline-block",
        verticalAlign: "middle",
      }}
      title={alt || name}
    />
  );
}

// Memoized version for high-frequency rendering cases
export const MemoIcon8 = memo(Icon8);

export default Icon8;
