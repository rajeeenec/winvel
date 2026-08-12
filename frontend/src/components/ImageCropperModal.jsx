import { useState, useRef } from 'react';
import './ImageCropperModal.css';

export default function ImageCropperModal({ src, onClose, onCrop }) {
  const imgRef = useRef(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const [cropBox, setCropBox] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgElement, setImgElement] = useState(null);

  const handleImageLoad = (e) => {
    const { clientWidth, clientHeight, naturalWidth, naturalHeight } = e.target;
    setDisplaySize({ width: clientWidth, height: clientHeight });
    setImageSize({ width: naturalWidth, height: naturalHeight });
    setImgElement(e.target);

    // Initial crop box size: 80% of width and height of the image container
    const w = Math.round(clientWidth * 0.8);
    const h = Math.round(clientHeight * 0.8);
    setCropBox({
      left: Math.round((clientWidth - w) / 2),
      top: Math.round((clientHeight - h) / 2),
      width: w,
      height: h,
    });
  };

  const handleMouseDown = (e, action) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;

    if (action === 'drag') {
      setIsDragging(true);
      setDragStart({ x: startX - cropBox.left, y: startY - cropBox.top });
    } else if (action === 'resize') {
      setIsResizing(true);
      setDragStart({ x: startX - cropBox.width, y: startY - cropBox.height });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging && !isResizing) return;

    const currentX = e.clientX;
    const currentY = e.clientY;

    if (isDragging) {
      let newLeft = currentX - dragStart.x;
      let newTop = currentY - dragStart.y;

      // Ensure crop box stays within image display boundaries
      newLeft = Math.max(0, Math.min(displaySize.width - cropBox.width, newLeft));
      newTop = Math.max(0, Math.min(displaySize.height - cropBox.height, newTop));

      setCropBox((prev) => ({ ...prev, left: newLeft, top: newTop }));
    } else if (isResizing) {
      let newWidth = currentX - dragStart.x;
      let newHeight = currentY - dragStart.y;

      // Minimum width & height constraints, and maximum boundary constraints
      newWidth = Math.max(40, Math.min(displaySize.width - cropBox.left, newWidth));
      newHeight = Math.max(20, Math.min(displaySize.height - cropBox.top, newHeight));

      setCropBox((prev) => ({ ...prev, width: newWidth, height: newHeight }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleSave = () => {
    if (!imgElement || !displaySize.width) return;

    // Calculate scale factor from display size to natural size
    const scaleX = imageSize.width / displaySize.width;
    const scaleY = imageSize.height / displaySize.height;

    const srcX = cropBox.left * scaleX;
    const srcY = cropBox.top * scaleY;
    const srcW = cropBox.width * scaleX;
    const srcH = cropBox.height * scaleY;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(srcW);
    canvas.height = Math.round(srcH);
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
          <p>Drag the box to move it. Drag the green dot in the bottom-right corner to resize the cropping area.</p>
        </div>

        <div className="cropper-workspace-free">
          <div
            className="cropper-container-free"
            style={{ width: displaySize.width || 'auto', height: displaySize.height || 'auto' }}
          >
            <img
              ref={imgRef}
              src={src}
              alt="Crop preview"
              className="cropper-image-free"
              onLoad={handleImageLoad}
            />
            {displaySize.width > 0 && (
              <div
                className="cropper-overlay-free"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                <div
                  className="cropper-box-free"
                  style={{
                    left: `${cropBox.left}px`,
                    top: `${cropBox.top}px`,
                    width: `${cropBox.width}px`,
                    height: `${cropBox.height}px`,
                  }}
                  onMouseDown={(e) => handleMouseDown(e, 'drag')}
                >
                  <div
                    className="cropper-handle-br"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleMouseDown(e, 'resize');
                    }}
                  />
                </div>
              </div>
            )}
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
