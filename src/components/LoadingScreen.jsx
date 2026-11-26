import React from 'react';

function LoadingScreen({ isExiting = false }) {
  return (
    <div
      className={`antana-loading-screen ${isExiting ? 'antana-loading-exit' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Cargando Antana"
    >
      <div className="antana-loading-glow" />

      <div className="antana-loading-content">
        <img
          src="/anim_planet.png"
          alt="Antana Icon"
          width="160"
          height="160"
          decoding="sync"
          fetchPriority="high"
          className="antana-loading-planet"
        />

        <h1 className="antana-loading-title">
          <span>ANT</span>ANA
        </h1>

        <div className="antana-loading-bar-track">
          <div className="antana-loading-bar-fill" />
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
