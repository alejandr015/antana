export const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD') // Descompone caracteres acentuados en su letra base + acento
    .replace(/[\u0300-\u036f]/g, '') // Elimina los caracteres de acento
    .toLowerCase()
    .trim();
};
