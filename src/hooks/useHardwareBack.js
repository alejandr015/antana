import { useEffect, useRef } from 'react';

let pendingBackTimeout = null;

export function useHardwareBack(isOpen, onBack, modalId) {
  const onBackRef = useRef(onBack);

  useEffect(() => {
    onBackRef.current = onBack;
  }, [onBack]);

  useEffect(() => {
    if (!isOpen) return;

    if (pendingBackTimeout) {
      clearTimeout(pendingBackTimeout);
      pendingBackTimeout = null;
    }

    // Obtener la profundidad actual del historial
    const currentDepth = window.history.state?.depth || 0;
    
    // Si ya estamos en este modal (por ejemplo en StrictMode doble render), usamos su misma profundidad.
    // Si no, le sumamos 1.
    const isAlreadyThisModal = window.history.state && window.history.state.modalId === modalId;
    const myDepth = isAlreadyThisModal ? currentDepth : currentDepth + 1;

    // Solo agregar al historial si no estamos ya en este modal
    if (!isAlreadyThisModal) {
      window.history.pushState({ modalId, depth: myDepth }, '');
    }

    const handlePopState = (e) => {
      const newDepth = window.history.state?.depth || 0;
      console.log(`useHardwareBack [${modalId}]: handlePopState! myDepth: ${myDepth}, newDepth: ${newDepth}`);
      
      // Si la nueva profundidad es mayor o igual a mi profundidad, significa que yo sigo en la pila
      // (fui yo, o alguien que está por encima de mí). Solo me cierro si la nueva profundidad es MENOR.
      if (newDepth >= myDepth) {
        console.log(`useHardwareBack [${modalId}]: Sigo siendo el top state o tengo un hijo activo, ignoro el pop.`);
        return;
      }
      
      if (onBackRef.current) {
        onBackRef.current();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Clean up the history state solo si sigue siendo este modal
      if (window.history.state && window.history.state.modalId === modalId) {
        // Envolvemos en setTimeout para evitar condiciones de carrera con Strict Mode
        pendingBackTimeout = setTimeout(() => {
          if (window.history.state && window.history.state.modalId === modalId) {
            window.history.back();
          }
        }, 50);
      }
    };
  }, [isOpen, modalId]);
}
