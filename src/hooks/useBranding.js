import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../services/db';

export function useBranding() {
  // Intentar cargar la marca desde la memoria del navegador para evitar el "parpadeo" de carga
  const getInitialBranding = () => {
    try {
      const cached = localStorage.getItem('antana_branding_cache');
      if (cached) return JSON.parse(cached);
    } catch (e) { }
    return {
      logoUrl: '/antana-logo-oficial.png',
      title: 'ANT<span>ANA</span>',
      description: 'Una mezcla perfecta entre lo industrial y lo retro. Disfruta de la mejor carne Angus certificada en el corazón de Neiva.'
    };
  };

  const [branding, setBranding] = useState(getInitialBranding);

  useEffect(() => {
    let mounted = true;
    const fetchBranding = async () => {
      try {
        const settings = await getSettings(true); // Forzar refresh para ignorar el caché
        
        if (mounted && settings?.branding) {
          setBranding(settings.branding);
        }
      } catch (error) {
        console.error("Error fetching branding", error);
      }
    };
    fetchBranding();
    
    // Escuchar actualizaciones en tiempo real cuando se guarda en el admin
    const handleSettingsUpdate = (event) => {
      if (mounted && event.detail?.branding) {
        setBranding(event.detail.branding);
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
      // Guardar en caché para evitar parpadeos en futuras recargas
      try {
        localStorage.setItem('antana_branding_cache', JSON.stringify(branding));
      } catch (e) { }

      // Actualizar Título
      // Remover tags HTML y asteriscos de markdown para el título del navegador
      const titleText = branding.title.replace(/<[^>]+>/g, '').replace(/\*/g, '');
      document.title = titleText ? `${titleText} | La Experiencia Angus en Neiva` : 'Antana';
      
      // Actualizar Favicon
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
