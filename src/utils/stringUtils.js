export const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD') // Descompone caracteres acentuados en su letra base + acento
    .replace(/[\u0300-\u036f]/g, '') // Elimina los caracteres de acento
    .toLowerCase()
    .trim();
};

export const normalizeBrandingMarkup = (text) => {
  if (!text) return '';
  return text
    .toString()
    .replace(/<span[^>]*>(.*?)<\/span>/gi, '*$1*');
};

export const stripHighlightMarkup = (text) => {
  if (!text) return '';
  return normalizeBrandingMarkup(text)
    .replace(/<[^>]+>/g, '')
    .replace(/\*/g, '')
    .trim();
};

export const formatHighlightedHtml = (text) => {
  if (!text) return '';
  const normalized = normalizeBrandingMarkup(text);
  const escaped = normalized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  return escaped.replace(/\*(.*?)\*/g, '<span>$1</span>');
};
