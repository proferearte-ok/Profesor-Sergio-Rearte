/**
 * Configuración del Calendario Académico Anual de la Universidad.
 * Para actualizar el calendario el año que viene, reemplace los valores de esta constante.
 */
export const CALENDARIO_ACADEMICO_CONFIG = {
  // ID del archivo PDF público en Google Drive
  driveFileId: "1mgl15ytxemlDf8PqAgye3v0A8tzq8QWy",
  
  // Año o ciclo lectivo correspondiente
  cicloLectivo: "2026",
  
  // Texto descriptivo corto que se muestra en la tarjeta destacada
  descripcion: "Calendario Académico UNLaR 2026: inscripciones, cursadas, exámenes, feriados y recesos",
};

// Genera la URL de descarga directa a partir del ID de Google Drive
export const getCalendarioDownloadUrl = (): string => {
  return `https://drive.google.com/uc?export=download&id=${CALENDARIO_ACADEMICO_CONFIG.driveFileId}`;
};
