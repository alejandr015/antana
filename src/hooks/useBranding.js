import { useState, useEffect } from 'react';
import { getSettings } from '../services/db';
import { normalizeBrandingMarkup, stripHighlightMarkup } from '../utils/stringUtils';

const DEFAULT_BRANDING = {
  logoUrl: '/antana-logo-oficial.png',
  title: 'Sabor *Angus* Inigualable',
  description: 'Una mezcla perfecta entre lo industrial y lo retro. Disfruta de la mejor carne Angus certificada en el corazón de Neiva.'
};

const sanitizeBranding = (rawBranding) => {
  if (!rawBranding) return DEFAULT_BRANDING;
  return {
    ...DEFAULT_BRANDING,
    ...rawBranding,
    title: normalizeBrandingMarkup(rawBranding.title || DEFAULT_BRANDING.title),
    description: normalizeBrandingMarkup(rawBranding.description || DEFAULT_BRANDING.description)
  };
};

export function useBranding() {
  // Intentar cargar la marca desde la memoria del navegador para evitar parpadeos de carga
  const getInitialBranding = () => {
    try {
      const cached = localStorage.getItem('antana_branding_cache');
      if (cached) return sanitizeBranding(JSON.parse(cached));
    } catch (e) { }
    return DEFAULT_BRANDING;
  };

  const [branding, setBranding] = useState(getInitialBranding);

  useEffect(() => {
    let mounted = true;
    const fetchBranding = async () => {
      try {
        const settings = await getSettings();
        if (mounted && settings?.branding) {
          setBranding(sanitizeBranding(settings.branding));
        }
      } catch (error) {
        console.error("Error fetching branding", error);
      }
    };
    fetchBranding();

    // Escuchar actualizaciones en tiempo real cuando se guarda en el admin
    const handleSettingsUpdate = (event) => {
      if (mounted && event.detail?.branding) {
        setBranding(sanitizeBranding(event.detail.branding));
      }
    };
    window.addEventListener('settingsUpdated', handleSettingsUpdate);

    return () => {
      mounted = false;
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, []);

  // Sincronizar título, favicon y localStorage cada vez que branding cambie
  useEffect(() => {
    if (branding) {
      try {
        localStorage.setItem('antana_branding_cache', JSON.stringify(branding));
      } catch (e) { }

      const titleText = stripHighlightMarkup(branding.title);
      document.title = titleText ? `${titleText} | La Experiencia Angus en Neiva` : 'Antana | La Experiencia Angus en Neiva';

      let link = document.getElementById('dynamic-favicon') || document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.id = 'dynamic-favicon';
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = branding.logoUrl;
    }
  }, [branding]);

  return branding;
}
