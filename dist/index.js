"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  SmartImage: () => SmartImage
});
module.exports = __toCommonJS(index_exports);

// src/components/SmartImage.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var SmartImage = ({
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
  const containerRef = (0, import_react.useRef)(null);
  const imgRef = (0, import_react.useRef)(null);
  const [loaded, setLoaded] = (0, import_react.useState)(false);
  const [error, setError] = (0, import_react.useState)(false);
  const [inView, setInView] = (0, import_react.useState)(!lazy);
  const hasGallery = Array.isArray(sources) && sources.length > 0;
  const gallerySources = hasGallery ? sources : src ? [String(src)] : [];
  const [currentIndex, setCurrentIndex] = (0, import_react.useState)(0);
  const [viewerOpen, setViewerOpen] = (0, import_react.useState)(false);
  const [scale, setScale] = (0, import_react.useState)(1);
  const [offset, setOffset] = (0, import_react.useState)({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = (0, import_react.useState)(false);
  const panStartRef = (0, import_react.useRef)({ x: 0, y: 0 });
  const offsetStartRef = (0, import_react.useRef)({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = (0, import_react.useState)(0);
  const [lastTouchScale, setLastTouchScale] = (0, import_react.useState)(1);
  const minScale = 1;
  const maxScale = 5;
  const zoomStep = 0.2;
  (0, import_react.useEffect)(() => {
    if (!lazy) return;
    const el = containerRef.current;
    if (!el) return;
    let obs;
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
  (0, import_react.useEffect)(() => setError(false), [currentIndex, src]);
  (0, import_react.useEffect)(() => {
    if (!viewerOpen) return;
    const onKey = (e) => {
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
  const wrapperStyle = {
    position: "relative",
    overflow: "hidden",
    display: "inline-block",
    ...aspectRatio ? { aspectRatio } : {},
    ...style
  };
  const imgStyle = {
    width: "100%",
    height: "100%",
    objectFit: cover ? "cover" : "contain",
    display: loaded ? "block" : "none",
    transition: "opacity 300ms ease",
    cursor: "zoom-in"
  };
  const isVideo = Boolean(videoUrl);
  const toYouTubeEmbed = (url) => {
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
    const wrapperStyle2 = {
      position: "relative",
      overflow: "hidden",
      display: "inline-block",
      ...aspectRatio ? { aspectRatio } : {},
      ...style
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: containerRef, style: wrapperStyle2, "aria-busy": false, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "iframe",
      {
        src: embedSrc,
        title: alt ?? "video",
        style: { width: "100%", height: "100%", border: 0, display: "block" },
        allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
        allowFullScreen: true
      }
    ) });
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
  const zoomIn = (cx, cy) => {
    setScale((s) => {
      const newScale = Math.min(maxScale, parseFloat((s + zoomStep).toFixed(3)));
      if (cx && cy) adjustOffsetOnZoom(s, newScale, cx, cy);
      return newScale;
    });
  };
  const zoomOut = (cx, cy) => {
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
  const zoomTo = (targetScale, cx, cy) => {
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
  const adjustOffsetOnZoom = (oldScale, newScale, cx, cy) => {
    const dx = (cx - offset.x) / oldScale;
    const dy = (cy - offset.y) / oldScale;
    setOffset({
      x: cx - dx * newScale,
      y: cy - dy * newScale
    });
  };
  const onWheelViewer = (e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
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
  const onDoubleClickViewer = (e) => {
    if (e.target !== e.currentTarget && !e.target.closest("img")) {
      return;
    }
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    if (scale === 1) zoomIn(cx, cy);
    else resetZoom();
  };
  const onPointerDown = (e) => {
    if (scale === 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsPanning(true);
    panStartRef.current = { x: e.clientX, y: e.clientY };
    offsetStartRef.current = { ...offset };
  };
  const onPointerMove = (e) => {
    if (!isPanning) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    setOffset({ x: offsetStartRef.current.x + dx, y: offsetStartRef.current.y + dy });
  };
  const endPan = () => setIsPanning(false);
  const getTouchDistance = (touches) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };
  const getTouchCenter = (touches) => {
    if (touches.length === 0) return { x: 0, y: 0 };
    if (touches.length === 1) return { x: touches[0].clientX, y: touches[0].clientY };
    const x = (touches[0].clientX + touches[1].clientX) / 2;
    const y = (touches[0].clientY + touches[1].clientY) / 2;
    return { x, y };
  };
  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      if (scale > 1) {
        setIsPanning(true);
        panStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        offsetStartRef.current = { ...offset };
      }
    } else if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);
      setLastTouchDistance(distance);
      setLastTouchScale(scale);
    }
  };
  const onTouchMove = (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && isPanning) {
      const dx = e.touches[0].clientX - panStartRef.current.x;
      const dy = e.touches[0].clientY - panStartRef.current.y;
      setOffset({ x: offsetStartRef.current.x + dx, y: offsetStartRef.current.y + dy });
    } else if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);
      if (lastTouchDistance > 0) {
        const scaleChange = distance / lastTouchDistance;
        const newScale = Math.max(minScale, Math.min(maxScale, lastTouchScale * scaleChange));
        setScale(newScale);
        const center = getTouchCenter(e.touches);
        const rect = e.currentTarget.getBoundingClientRect();
        const cx = center.x - rect.left;
        const cy = center.y - rect.top;
        adjustOffsetOnZoom(lastTouchScale, newScale, cx, cy);
      }
    }
  };
  const onTouchEnd = (e) => {
    if (e.touches.length === 0) {
      setIsPanning(false);
      setLastTouchDistance(0);
    } else if (e.touches.length === 1) {
      setLastTouchDistance(0);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ref: containerRef, style: wrapperStyle, "aria-busy": !loaded, children: [
    !hasGallery && blurUpSrc && !loaded && !error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "img",
      {
        src: blurUpSrc,
        alt,
        style: { width: "100%", height: "100%", objectFit: cover ? "cover" : "contain", filter: "blur(8px)", transform: "scale(1.05)" },
        "aria-hidden": true
      }
    ),
    !loaded && !error && !blurUpSrc && (loader ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: "100%", height: "100%", background: "#eee" } })),
    inView && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "img",
      {
        ref: imgRef,
        src: error ? fallback ?? "" : currentSrc,
        alt,
        onLoad,
        onError,
        style: imgStyle,
        onClick: openViewer,
        ...rest
      }
    ),
    error && fallback && loaded === false && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: fallback, alt, style: { width: "100%", height: "100%", objectFit: cover ? "cover" : "contain" } }),
    gallerySources.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", gap: 8, marginTop: 8, overflowX: "auto", paddingBottom: 4 }, children: gallerySources.map((thumbSrc, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        onClick: () => {
          setCurrentIndex(i);
          resetZoom();
        },
        style: {
          border: i === currentIndex ? "2px solid #333" : "1px solid #ccc",
          padding: 0,
          borderRadius: 4,
          background: "transparent",
          cursor: "pointer"
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: thumbSrc, alt, style: { width: 64, height: 64, objectFit: "cover", borderRadius: 4 }, loading: "lazy" })
      },
      thumbSrc + i
    )) }),
    viewerOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "div",
      {
        role: "dialog",
        "aria-modal": "true",
        onClick: () => setViewerOpen(false),
        style: {
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.95)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          touchAction: "none"
        },
        onWheel: onWheelViewer,
        onDoubleClick: onDoubleClickViewer,
        onPointerDown,
        onPointerMove,
        onPointerUp: endPan,
        onPointerCancel: endPan,
        onTouchStart,
        onTouchMove,
        onTouchEnd,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "img",
            {
              src: currentSrc,
              alt,
              onClick: (e) => e.stopPropagation(),
              style: {
                maxWidth: "90vw",
                maxHeight: "90vh",
                objectFit: "contain",
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                transition: isPanning ? "none" : "transform 200ms cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: scale > 1 ? isPanning ? "grabbing" : "grab" : "zoom-in",
                willChange: "transform"
              }
            }
          ),
          gallerySources.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                onClick: (e) => {
                  e.stopPropagation();
                  goPrev();
                },
                style: navBtnStyle("left"),
                "aria-label": "Previous",
                children: "\u2039"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                onClick: (e) => {
                  e.stopPropagation();
                  goNext();
                },
                style: navBtnStyle("right"),
                "aria-label": "Next",
                children: "\u203A"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: {
              position: "fixed",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              color: "#fff",
              fontSize: 14,
              background: "rgba(0,0,0,0.3)",
              padding: "8px 16px",
              borderRadius: "20px",
              backdropFilter: "blur(10px)"
            }, children: [
              currentIndex + 1,
              " / ",
              gallerySources.length
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "div",
            {
              onClick: (e) => e.stopPropagation(),
              onDoubleClick: (e) => e.stopPropagation(),
              style: {
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
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                ControlButton,
                {
                  onClick: (e) => {
                    e.stopPropagation();
                    resetZoom();
                  },
                  style: {
                    minWidth: "60px",
                    fontSize: "14px",
                    fontWeight: "600"
                  },
                  children: [
                    Math.round(scale * 100),
                    "%"
                  ]
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            ControlButton,
            {
              onClick: (e) => {
                e.stopPropagation();
                setViewerOpen(false);
              },
              style: { position: "fixed", top: 20, right: 20 },
              children: "\u2715"
            }
          )
        ]
      }
    )
  ] });
};
var ControlButton = ({ children, style, disabled, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
  "button",
  {
    ...props,
    disabled,
    style: {
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
    },
    onMouseEnter: (e) => {
      if (!disabled) {
        e.currentTarget.style.background = "rgba(255,255,255,0.25)";
        e.currentTarget.style.transform = "scale(1.05)";
      }
    },
    onMouseLeave: (e) => {
      if (!disabled) {
        e.currentTarget.style.background = "rgba(255,255,255,0.15)";
        e.currentTarget.style.transform = "scale(1)";
      }
    },
    children
  }
);
var navBtnStyle = (side) => ({
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SmartImage
});
//# sourceMappingURL=index.js.map