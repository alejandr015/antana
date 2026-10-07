import { useState, useEffect } from 'react';

export function useSessionState(key, initialValue) {
  const [value, setValue] = useState(() => {
    const saved = sessionStorage.getItem(key);
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return saved;
      }
    }
    return initialValue;
  });

  useEffect(() => {
    if (value === undefined) {
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);

  return [value, setValue];
}
