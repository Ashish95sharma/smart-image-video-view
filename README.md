# smart-photo-view

A tiny, zero-dependency React component for smarter images and media:
- Lazy loading with IntersectionObserver
- Blur-up preview
- Fallback image on error
- Aspect ratio box
- Click-to-open fullscreen viewer
- Zoom (wheel/double-click), pan, and touch pinch-to-zoom
- Simple gallery with thumbnails and keyboard navigation
- Optional video embedding (YouTube links supported)

## Install

```bash
npm install smart-photo-view
# or
yarn add smart-photo-view
# or
pnpm add smart-photo-view
```

## Quick start

```tsx
import { SmartImage } from "smart-photo-view";

export default function Example() {
  return (
    <div style={{ width: 400 }}>
      <SmartImage
        src="https://example.com/images/mountains-1200.jpg"
        alt="Mountains"
        aspectRatio="16/9"
        blurUpSrc="https://example.com/images/mountains-64-blur.jpg"
      />
    </div>
  );
}
```

## Props

```ts
export interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;            // Shown if main image fails to load
  loader?: React.ReactNode;     // Custom loader while loading
  lazy?: boolean;               // Defaults to true. Disable to load immediately
  aspectRatio?: string;         // CSS aspect-ratio value, e.g. "16/9", "1/1"
  blurUpSrc?: string;           // Low-res blurred preview source
  cover?: boolean;              // true → object-fit: cover, false → contain
  sources?: string[];           // If provided, enables gallery + viewer
  videoUrl?: string;            // If provided, renders a video (e.g. YouTube)
}
```

Notes:
- Click image to open the fullscreen viewer.
- In viewer: Arrow keys to navigate, Esc to close, + / - to zoom, 0..2 to quick zoom, R to reset.
- On touch devices: pinch to zoom, drag to pan.

## Gallery example

```tsx
<SmartImage
  alt="Gallery"
  sources={[
    "https://example.com/photos/1015-1200x800.jpg",
    "https://example.com/photos/1016-1200x800.jpg",
    "https://example.com/photos/1020-1200x800.jpg"
  ]}
  aspectRatio="3/2"
/>
```

## Video example

```tsx
<SmartImage
  alt="Demo video"
  aspectRatio="16/9"
  videoUrl="https://video.example.com/watch?v=VIDEO_ID"
/>
```

## Why this component?

- Single component with sensible defaults
- Works with plain `<img>` props and accepts all image attributes
- No external CSS; styles inline and encapsulated

## License

ISC © 2025 Your Name
