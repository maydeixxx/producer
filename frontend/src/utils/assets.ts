export const getAssetUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  // Clean base URL without trailing slash
  const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
  
  // Clean target path without leading slash
  const cleanPath = path.replace(/^\/+/, '').replace(/^producer\/+/, '');
  
  return `${base}/${cleanPath}`;
};
