/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DriveFile {
  id: string;
  nombre_archivo: string;
  link_drive: string;
  mimeType: string;
  fecha_subida: string;
}

/**
 * Consulta la API de Google Drive v3 para listar los archivos contenidos en un folderId.
 * Requiere la variable de entorno VITE_GOOGLE_DRIVE_API_KEY.
 */
export async function listDriveFolderFiles(folderId: string): Promise<DriveFile[]> {
  const apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey.startsWith("TU_API_KEY") || apiKey.includes("KEY_AQUI")) {
    throw new Error("API Key de Google Drive no configurada. Por favor, contacte al administrador.");
  }

  if (!folderId || folderId.trim() === "") {
    throw new Error("ID de carpeta de Google Drive inválido o vacío.");
  }

  // Sanitizar el folderId para evitar inyección de consultas
  const escapedFolderId = folderId.replace(/'/g, "\\'");
  const q = `'${escapedFolderId}' in parents and trashed = false`;
  const fields = "files(id, name, mimeType, modifiedTime, webViewLink)";
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const errorMsg = errJson?.error?.message || "";
      
      if (response.status === 400) {
        throw new Error("Petición incorrecta a Google Drive. Verifique el ID de la carpeta.");
      } else if (response.status === 403) {
        if (errorMsg.toLowerCase().includes("quota") || errorMsg.toLowerCase().includes("limit")) {
          throw new Error("Límite de cuota excedido para la API de Google Drive.");
        }
        throw new Error("Acceso denegado. Verifique que la carpeta de Drive esté compartida públicamente ('Cualquier persona con el enlace puede ver') y que la API Key sea válida.");
      } else if (response.status === 404) {
        throw new Error("La carpeta de Google Drive especificada no fue encontrada.");
      } else {
        throw new Error(`Error al consultar Google Drive (${response.status}): ${errorMsg || response.statusText}`);
      }
    }

    const data = await response.json();
    const files = data.files || [];

    if (files.length === 0) {
      return [];
    }

    // Ordenar los archivos por fecha de modificación descendente (los más nuevos primero)
    const sortedFiles = files.slice().sort((a: any, b: any) => {
      const timeA = a.modifiedTime ? new Date(a.modifiedTime).getTime() : 0;
      const timeB = b.modifiedTime ? new Date(b.modifiedTime).getTime() : 0;
      return timeB - timeA;
    });

    // Mapear los archivos obtenidos de Drive a la estructura unificada
    return sortedFiles.map((file: any) => {
      // Si es un archivo de Google Suite nativo (Docs, Slides, Sheets), usamos el webViewLink.
      // Si es un archivo binario subido (PDF, ZIP, DOCX, etc.), armamos el link de descarga directa.
      const isGoogleType = file.mimeType?.startsWith("application/vnd.google-apps.");
      const link_drive = isGoogleType && file.webViewLink
        ? file.webViewLink
        : `https://docs.google.com/uc?export=download&id=${file.id}`;

      // Formatear la fecha
      let fecha_subida = "";
      if (file.modifiedTime) {
        try {
          fecha_subida = new Date(file.modifiedTime).toLocaleDateString("es-AR");
        } catch {
          fecha_subida = new Date().toLocaleDateString("es-AR");
        }
      } else {
        fecha_subida = new Date().toLocaleDateString("es-AR");
      }

      return {
        id: file.id,
        nombre_archivo: file.name || "Archivo sin título",
        link_drive,
        mimeType: file.mimeType || "",
        fecha_subida
      };
    });

  } catch (error: any) {
    console.error("Error al obtener archivos de Google Drive:", error);
    if (error.message && (
      error.message.includes("no configurada") || 
      error.message.includes("inválido") || 
      error.message.includes("Límite de cuota") ||
      error.message.includes("Acceso denegado") ||
      error.message.includes("no fue encontrada") ||
      error.message.includes("Petición incorrecta")
    )) {
      throw error;
    }
    throw new Error("No se pudo conectar con el servicio de Google Drive. Verifica tu conexión de red.");
  }
}
