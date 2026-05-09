/**
 * Lightweight route chunk loader — avoids heavy UI imports during initial paint.
 */
export default function RoutePageFallback() {
  return (
    <div
      className="route-page-fallback"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
      style={{
        minHeight: "40vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <span
        style={{
          width: "2rem",
          height: "2rem",
          border: "3px solid color-mix(in srgb, currentColor 22%, transparent)",
          borderTopColor: "currentColor",
          borderRadius: "50%",
          animation: "route-fallback-spin 0.7s linear infinite",
        }}
      />
      <style>{`
        @keyframes route-fallback-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
