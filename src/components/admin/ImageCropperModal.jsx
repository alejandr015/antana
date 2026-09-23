import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';

const ImageCropperModal = ({ imageSrc, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const handleSave = () => {
    if (croppedAreaPixels) {
      onCropComplete(croppedAreaPixels);
    }
  };

  return (
    <div className="admin-cropper-overlay">
      <div className="admin-cropper-card glass">
        <div className="admin-cropper-header">
          <h3>Encuadrar Foto</h3>
          <button className="admin-cropper-close-btn" onClick={onCancel}>
            <X size={24} />
          </button>
        </div>

        <div className="admin-cropper-container">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1} /* 1:1 Aspect Ratio para estandarizar en cuadrado perfecto */
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={onZoomChange}
            showGrid={true}
          />
        </div>

        <div className="admin-cropper-controls">
          <div className="admin-cropper-zoom">
            <ZoomOut size={18} className="zoom-icon" />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="zoom-slider"
            />
            <ZoomIn size={18} className="zoom-icon" />
          </div>
          
          <div className="admin-cropper-actions">
            <button className="admin-cropper-cancel-btn" onClick={onCancel}>
              Cancelar
            </button>
            <button className="cta-button" onClick={handleSave}>
              <Check size={18} />
              Aceptar Recorte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
