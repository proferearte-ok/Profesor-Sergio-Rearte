/**
 * Utility functions to handle and normalize Google Drive links for images and files.
 */

/**
 * Extrae el ID único de un archivo de Google Drive desde diversos formatos de URL.
 */
export function extractDriveFileId(url: string | undefined | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Formato 1: /file/d/{ID}/
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{20,})/);
  if (fileDMatch && fileDMatch[1]) {
    return fileDMatch[1];
  }

  // Formato 2: ?id={ID} o &id={ID} (uc?export=view&id=..., open?id=..., thumbnail?id=...)
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{20,})/);
  if (idParamMatch && idParamMatch[1]) {
    return idParamMatch[1];
  }

  // Formato 3: lh3.googleusercontent.com/d/{ID}
  const lh3Match = trimmed.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]{20,})/);
  if (lh3Match && lh3Match[1]) {
    return lh3Match[1];
  }

  // Formato 4: Coincidencia genérica /d/{ID} en dominios de Google
  if (trimmed.includes("google") || trimmed.includes("drive")) {
    const genericDMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
    if (genericDMatch && genericDMatch[1]) {
      return genericDMatch[1];
    }
  }

  return null;
}

/**
 * Normaliza un link de imagen de Google Drive (o URL externa) para garantizar su correcto renderizado
 * mediante el CDN directo de Google (https://lh3.googleusercontent.com/d/{ID}).
 */
export function normalizeDriveImageUrl(url: string | undefined | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  const fileId = extractDriveFileId(trimmed);
  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  return trimmed;
}

/**
 * Normaliza un link de archivo/documento de Google Drive para permitir vista/descarga directa.
 */
export function normalizeDriveFileUrl(url: string | undefined | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  const fileId = extractDriveFileId(trimmed);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
  }

  return trimmed;
}
