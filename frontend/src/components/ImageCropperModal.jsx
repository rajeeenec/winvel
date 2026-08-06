import { useState, useEffect, useRef } from 'react';
import './ImageCropperModal.css';

export default function ImageCropperModal({ src, onClose, onCrop }) {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [baseSize, setBaseSize] = useState({ width: 0, height: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.0);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgElement, setImgElement] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      setImageSize({ width: w, height: h });
      setImgElement(img);

      const viewportW = 240;
      const viewportH = 80;
      const aspect = w / h;
      const viewportAspect = viewportW / viewportH;

      let baseW, baseH;
      if (aspect > viewportAspect) {
        baseH = viewportH;
        baseW = viewportH * aspect;
      } else {
        baseW = viewportW;
        baseH = viewportW / aspect;
      }

      setBaseSize({ width: baseW, height: baseH });

      // Center the image in viewport
      const initialX = (viewportW - baseW) / 2;
      const initialY = (viewportH - baseH) / 2;
      setPosition({ x: initialX, y: initialY });
      setZoom(1.0);
    };
  }, [src]);

  const getConstrainedPosition = (x, y, currentZoom) => {
    const viewportW = 240;
    const viewportH = 80;
    const currentW = baseSize.width * currentZoom;
    const currentH = baseSize.height * currentZoom;

    let newX = x;
    let newY = y;

    if (currentW > viewportW) {
      newX = Math.max(viewportW - currentW, Math.min(0, newX));
    } else {
      newX = 0;
    }

    if (currentH > viewportH) {
      newY = Math.max(viewportH - currentH, Math.min(0, newY));
    } else {
      newY = 0;
    }

    return { x: newX, y: newY };
  };

  const handleMouseDown = (e) => {
    setDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPosition(getConstrainedPosition(newX, newY, zoom));
  };

  const handleMouseUpOrLeave = () => {
    setDragging(false);
  };

  const handleZoomChange = (e) => {
    const nextZoom = parseFloat(e.target.value);
    const viewportW = 240;
    const viewportH = 80;

    const centerX = viewportW / 2;
    const centerY = viewportH / 2;

    const imgX = (centerX - position.x) / zoom;
    const imgY = (centerY - position.y) / zoom;

    const nextX = centerX - imgX * nextZoom;
    const nextY = centerY - imgY * nextZoom;

    setZoom(nextZoom);
    setPosition(getConstrainedPosition(nextX, nextY, nextZoom));
  };

  const handleSave = () => {
    if (!imgElement || !baseSize.width) return;

    const viewportW = 240;
    const viewportH = 80;
    const currentW = baseSize.width * zoom;

    // Aspect scaling ratio
    const scale = imageSize.width / currentW;
    const srcX = -position.x * scale;
    const srcY = -position.y * scale;
    const srcW = viewportW * scale;
    const srcH = viewportH * scale;

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(imgElement, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const croppedFile = new File([blob], 'logo.png', { type: 'image/png' });
      onCrop(croppedFile);
    }, 'image/png');
  };

  return (
    <div className="cropper-backdrop">
      <div className="cropper-modal">
        <div className="cropper-header">
          <h3>Crop Store Logo</h3>
          <p>Drag the image to adjust position, and use the zoom slider below to resize. The dashed border is the final crop area.</p>
        </div>

        <div className="cropper-workspace">
          <div
            className="cropper-viewport"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
          >
            {imgElement && (
              <img
                src={src}
                alt="Crop preview"
                className="cropper-image"
                style={{
                  width: `${baseSize.width * zoom}px`,
                  height: `${baseSize.height * zoom}px`,
                  transform: `translate(${position.x}px, ${position.y}px)`,
                }}
              />
            )}
          </div>
        </div>

        <div className="cropper-controls">
          <div className="cropper-zoom-row">
            <span>Zoom:</span>
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.05"
              value={zoom}
              onChange={handleZoomChange}
              className="cropper-slider"
            />
            <span>{Math.round(zoom * 100)}%</span>
          </div>
        </div>

        <div className="cropper-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            Crop & Upload
          </button>
        </div>
      </div>
    </div>
  );
}
