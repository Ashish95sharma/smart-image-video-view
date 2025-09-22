import React, { useEffect, useRef, useState } from "react";

export interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  loader?: React.ReactNode;
  lazy?: boolean;
  aspectRatio?: string; // e.g. "16/9" or "1/1"
  blurUpSrc?: string; // small blurred preview
  cover?: boolean;
  sources?: string[];
  videoUrl?: string; // if provided, renders a video in place of image
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  fallback,
  loader,
  lazy = true,
  aspectRatio,
  blurUpSrc,
  cover = true,
  style,
  sources,
  videoUrl,
  ...rest
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(!lazy);

  const hasGallery = Array.isArray(sources) && sources.length > 0;
  const gallerySources = hasGallery ? sources! : (src ? [String(src)] : []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);

  // Zoom + Pan state
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const offsetStartRef = useRef({ x: 0, y: 0 });

  // Touch/pinch zoom state
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [lastTouchScale, setLastTouchScale] = useState(1);

  const minScale = 1;
  const maxScale = 5;
  const zoomStep = 0.2;

  useEffect(() => {
    if (!lazy) return;
    const el = containerRef.current;
    if (!el) return;
    let obs: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      obs = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            setInView(true);
            obs?.disconnect();
          }
        },
        { rootMargin: "200px" }
      );
      obs.observe(el);
    } else setInView(true);
    return () => obs?.disconnect();
  }, [lazy]);

  useEffect(() => setError(false), [currentIndex, src]);

  useEffect(() => {
    if (!viewerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewerOpen(false);
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomIn();
      }
      if (e.key === "-") {
        e.preventDefault();
        zoomOut();
      }
      if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        resetZoom();
      }
      if (e.key === "0") {
        e.preventDefault();
        zoomTo(1);
      }
      if (e.key === "1") {
        e.preventDefault();
        zoomTo(2);
      }
      if (e.key === "2") {
        e.preventDefault();
        zoomTo(3);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewerOpen, scale]);

  const onLoad = () => setLoaded(true);
  const onError = () => setError(true);

  const wrapperStyle: React.CSSProperties = {
    position: "relative",
    overflow: "hidden",
    display: "inline-block",
    ...(aspectRatio ? { aspectRatio } : {}),
    ...style
  };

  const imgStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: cover ? "cover" : "contain",
    display: loaded ? "block" : "none",
    transition: "opacity 300ms ease",
    cursor: "zoom-in"
  };

  // --- Video support ---
  const isVideo = Boolean(videoUrl);
  const toYouTubeEmbed = (url: string): string => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube.com")) {
        const videoId = u.searchParams.get("v");
        const list = u.searchParams.get("list");
        const index = u.searchParams.get("index");
        const base = videoId ? `https://www.youtube.com/embed/${videoId}` : "";
        const params = new URLSearchParams();
        if (list) params.set("list", list);
        if (index) params.set("index", index);
        const qs = params.toString();
        return qs ? `${base}?${qs}` : base;
      }
      if (u.hostname.includes("youtu.be")) {
        const id = u.pathname.replace("/", "");
        return `https://www.youtube.com/embed/${id}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  if (isVideo) {
    const embedSrc = toYouTubeEmbed(String(videoUrl));
    const wrapperStyle: React.CSSProperties = {
      position: "relative",
      overflow: "hidden",
      display: "inline-block",
      ...(aspectRatio ? { aspectRatio } : {}),
      ...style
    };

    return (
      <div ref={containerRef} style={wrapperStyle} aria-busy={false}>
        <iframe
          src={embedSrc}
          title={alt ?? "video"}
          style={{ width: "100%", height: "100%", border: 0, display: "block" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  const currentSrc = gallerySources[currentIndex] ?? "";

  const goPrev = () => {
    setCurrentIndex((i) => (i - 1 + gallerySources.length) % gallerySources.length);
    resetZoom();
  };
  const goNext = () => {
    setCurrentIndex((i) => (i + 1) % gallerySources.length);
    resetZoom();
  };
  const openViewer = () => {
    setViewerOpen(true);
    resetZoom();
  };

  // --- Zoom logic ---
  const zoomIn = (cx?: number, cy?: number) => {
    setScale((s) => {
      const newScale = Math.min(maxScale, parseFloat((s + zoomStep).toFixed(3)));
      if (cx && cy) adjustOffsetOnZoom(s, newScale, cx, cy);
      return newScale;
    });
  };
  const zoomOut = (cx?: number, cy?: number) => {
    setScale((s) => {
      const newScale = Math.max(minScale, parseFloat((s - zoomStep).toFixed(3)));
      if (cx && cy) adjustOffsetOnZoom(s, newScale, cx, cy);
      if (newScale === 1) setOffset({ x: 0, y: 0 });
      return newScale;
    });
  };
  const resetZoom = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  // Smooth zoom to specific scale
  const zoomTo = (targetScale: number, cx?: number, cy?: number) => {
    const clampedScale = Math.max(minScale, Math.min(maxScale, targetScale));
    setScale(clampedScale);
    if (cx && cy) {
      const rect = document.querySelector('[role="dialog"]')?.getBoundingClientRect();
      if (rect) {
        adjustOffsetOnZoom(scale, clampedScale, cx - rect.left, cy - rect.top);
      }
    }
    if (clampedScale === 1) setOffset({ x: 0, y: 0 });
  };

  // Keep zoom centered on cursor
  const adjustOffsetOnZoom = (oldScale: number, newScale: number, cx: number, cy: number) => {
    const dx = (cx - offset.x) / oldScale;
    const dy = (cy - offset.y) / oldScale;
    setOffset({
      x: cx - dx * newScale,
      y: cy - dy * newScale
    });
  };

  const onWheelViewer: React.WheelEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    // More sensitive zoom with smaller steps for wheel
    const wheelZoomStep = zoomStep * 0.5;
    const currentScale = scale;

    if (e.deltaY < 0) {
      const newScale = Math.min(maxScale, parseFloat((currentScale + wheelZoomStep).toFixed(3)));
      setScale(newScale);
      if (cx && cy) adjustOffsetOnZoom(currentScale, newScale, cx, cy);
    } else {
      const newScale = Math.max(minScale, parseFloat((currentScale - wheelZoomStep).toFixed(3)));
      setScale(newScale);
      if (cx && cy) adjustOffsetOnZoom(currentScale, newScale, cx, cy);
      if (newScale === 1) setOffset({ x: 0, y: 0 });
    }
  };

  const onDoubleClickViewer: React.MouseEventHandler<HTMLDivElement> = (e) => {
    // Only handle double-click on the image itself, not on controls
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).closest('img')) {
      return;
    }
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    if (scale === 1) zoomIn(cx, cy);
    else resetZoom();
  };

  // --- Pan logic ---
  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (scale === 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsPanning(true);
    panStartRef.current = { x: e.clientX, y: e.clientY };
    offsetStartRef.current = { ...offset };
  };
  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!isPanning) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    setOffset({ x: offsetStartRef.current.x + dx, y: offsetStartRef.current.y + dy });
  };
  const endPan = () => setIsPanning(false);

  // Touch handlers for pinch-to-zoom
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touches: React.TouchList) => {
    if (touches.length === 0) return { x: 0, y: 0 };
    if (touches.length === 1) return { x: touches[0].clientX, y: touches[0].clientY };

    const x = (touches[0].clientX + touches[1].clientX) / 2;
    const y = (touches[0].clientY + touches[1].clientY) / 2;
    return { x, y };
  };

  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (e.touches.length === 1) {
      // Single touch - start panning
      if (scale > 1) {
        setIsPanning(true);
        panStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        offsetStartRef.current = { ...offset };
      }
    } else if (e.touches.length === 2) {
      // Two touches - start pinch zoom
      const distance = getTouchDistance(e.touches);
      setLastTouchDistance(distance);
      setLastTouchScale(scale);
    }
  };

  const onTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();

    if (e.touches.length === 1 && isPanning) {
      // Single touch panning
      const dx = e.touches[0].clientX - panStartRef.current.x;
      const dy = e.touches[0].clientY - panStartRef.current.y;
      setOffset({ x: offsetStartRef.current.x + dx, y: offsetStartRef.current.y + dy });
    } else if (e.touches.length === 2) {
      // Two touches - pinch zoom
      const distance = getTouchDistance(e.touches);
      if (lastTouchDistance > 0) {
        const scaleChange = distance / lastTouchDistance;
        const newScale = Math.max(minScale, Math.min(maxScale, lastTouchScale * scaleChange));
        setScale(newScale);

        // Center zoom on touch center
        const center = getTouchCenter(e.touches);
        const rect = e.currentTarget.getBoundingClientRect();
        const cx = center.x - rect.left;
        const cy = center.y - rect.top;
        adjustOffsetOnZoom(lastTouchScale, newScale, cx, cy);
      }
    }
  };

  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (e.touches.length === 0) {
      setIsPanning(false);
      setLastTouchDistance(0);
    } else if (e.touches.length === 1) {
      setLastTouchDistance(0);
    }
  };

  return (
    <div ref={containerRef} style={wrapperStyle} aria-busy={!loaded}>
      {!hasGallery && blurUpSrc && !loaded && !error && (
        <img
          src={blurUpSrc}
          alt={alt}
          style={{ width: "100%", height: "100%", objectFit: cover ? "cover" : "contain", filter: "blur(8px)", transform: "scale(1.05)" }}
          aria-hidden
        />
      )}
      {!loaded && !error && !blurUpSrc && (loader ?? <div style={{ width: "100%", height: "100%", background: "#eee" }} />)}
      {inView && (
        <img
          ref={imgRef}
          src={error ? fallback ?? "" : currentSrc}
          alt={alt}
          onLoad={onLoad}
          onError={onError}
          style={imgStyle}
          onClick={openViewer}
          {...rest}
        />
      )}
      {error && fallback && loaded === false && (
        <img src={fallback} alt={alt} style={{ width: "100%", height: "100%", objectFit: cover ? "cover" : "contain" }} />
      )}

      {gallerySources.length > 1 && (
        <div style={{ display: "flex", gap: 8, marginTop: 8, overflowX: "auto", paddingBottom: 4 }}>
          {gallerySources.map((thumbSrc, i) => (
            <button
              key={thumbSrc + i}
              onClick={() => { setCurrentIndex(i); resetZoom(); }}
              style={{
                border: i === currentIndex ? "2px solid #333" : "1px solid #ccc",
                padding: 0, borderRadius: 4, background: "transparent", cursor: "pointer"
              }}
            >
              <img src={thumbSrc} alt={alt} style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 4 }} loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {viewerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setViewerOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999, touchAction: "none"
          }}
          onWheel={onWheelViewer}
          onDoubleClick={onDoubleClickViewer}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPan}
          onPointerCancel={endPan}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <img
            src={currentSrc}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transition: isPanning ? "none" : "transform 200ms cubic-bezier(0.4, 0, 0.2, 1)",
              cursor: scale > 1 ? (isPanning ? "grabbing" : "grab") : "zoom-in",
              willChange: "transform"
            }}
          />

          {/* Prev / Next */}
          {gallerySources.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); goPrev(); }}
                style={navBtnStyle("left")} aria-label="Previous">‹</button>
              <button onClick={(e) => { e.stopPropagation(); goNext(); }}
                style={navBtnStyle("right")} aria-label="Next">›</button>
              <div style={{
                position: "fixed", bottom: 20, left: "50%",
                transform: "translateX(-50%)", color: "#fff", fontSize: 14,
                background: "rgba(0,0,0,0.3)",
                padding: "8px 16px",
                borderRadius: "20px",
                backdropFilter: "blur(10px)"
              }}>
                {currentIndex + 1} / {gallerySources.length}
              </div>
            </>
          )}

          {/* Zoom Controls (only reset/percentage) */}
          <div
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              bottom: 20,
              right: 20,
              display: "flex",
              gap: 8,
              alignItems: "center",
              background: "rgba(0,0,0,0.3)",
              padding: "8px 12px",
              borderRadius: "12px",
              backdropFilter: "blur(10px)"
            }}
          >
            <ControlButton
              onClick={(e) => {
                e.stopPropagation();
                resetZoom();
              }}
              style={{
                minWidth: "60px",
                fontSize: "14px",
                fontWeight: "600"
              }}
            >
              {Math.round(scale * 100)}%
            </ControlButton>
          </div>



          <ControlButton onClick={(e) => { e.stopPropagation(); setViewerOpen(false); }}
            style={{ position: "fixed", top: 20, right: 20 }}>✕</ControlButton>
        </div>
      )}
    </div>
  );
};

// Reusable styled buttons
const ControlButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, style, disabled, ...props }) => (
  <button
    {...props}
    disabled={disabled}
    style={{
      background: disabled ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.15)",
      color: disabled ? "rgba(255,255,255,0.5)" : "#fff",
      border: "none",
      padding: "10px 14px",
      borderRadius: 8,
      cursor: disabled ? "not-allowed" : "pointer",
      fontSize: 16,
      boxShadow: disabled ? "none" : "0 2px 6px rgba(0,0,0,0.4)",
      transition: "all 0.2s ease",
      transform: disabled ? "none" : "scale(1)",
      ...style
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        e.currentTarget.style.background = "rgba(255,255,255,0.25)";
        e.currentTarget.style.transform = "scale(1.05)";
      }
    }}
    onMouseLeave={(e) => {
      if (!disabled) {
        e.currentTarget.style.background = "rgba(255,255,255,0.15)";
        e.currentTarget.style.transform = "scale(1)";
      }
    }}
  >
    {children}
  </button>
);

const navBtnStyle = (side: "left" | "right"): React.CSSProperties => ({
  position: "fixed",
  [side]: 20,
  top: "50%",
  transform: "translateY(-50%)",
  background: "rgba(255,255,255,0.15)",
  color: "#fff",
  border: "none",
  padding: "14px 16px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 22,
  boxShadow: "0 2px 6px rgba(0,0,0,0.4)"
});
