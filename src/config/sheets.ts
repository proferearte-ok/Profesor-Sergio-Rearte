/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SheetConfig {
  spreadsheetId: string;
  sheetName: string;
}

export interface CatedraSheets {
  asistencia: SheetConfig;
  notas: SheetConfig;
}

const requiredEnvVars = {
  VITE_SHEET_ID_BIOMOL_ASISTENCIA: import.meta.env.VITE_SHEET_ID_BIOMOL_ASISTENCIA,
  VITE_SHEET_ID_BIOMOL_NOTAS: import.meta.env.VITE_SHEET_ID_BIOMOL_NOTAS,
  VITE_SHEET_ID_TECNOII_ASISTENCIA: import.meta.env.VITE_SHEET_ID_TECNOII_ASISTENCIA,
  VITE_SHEET_ID_TECNOII_NOTAS: import.meta.env.VITE_SHEET_ID_TECNOII_NOTAS,
  VITE_SHEET_ID_TECNOIII_ASISTENCIA: import.meta.env.VITE_SHEET_ID_TECNOIII_ASISTENCIA,
  VITE_SHEET_ID_TECNOIII_NOTAS: import.meta.env.VITE_SHEET_ID_TECNOIII_NOTAS,
};

// Validar en consola si falta alguna variable de entorno
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value || value.startsWith("TU_ID_AQUI"))
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.warn(
    `⚠️ [CONFIGURACIÓN] Faltan configurar o contienen marcadores las siguientes variables de entorno en tu archivo .env.local:\n` +
    missingVars.map(v => `   - ${v}`).join("\n") +
    `\nLa aplicación utilizará de forma automática datos mock/de prueba en las pantallas afectadas.`
  );
}

/**
 * Configuración de IDs de planillas de Google Sheets por cátedra.
 * Los valores se cargan desde variables de entorno para mayor seguridad.
 */
export const SHEETS_CONFIG: Record<string, CatedraSheets> = {
  BIO_MOL: {
    asistencia: {
      spreadsheetId: import.meta.env.VITE_SHEET_ID_BIOMOL_ASISTENCIA || "TU_ID_AQUI_BIO_MOL_ASISTENCIA",
      sheetName: "Asistencia"
    },
    notas: {
      spreadsheetId: import.meta.env.VITE_SHEET_ID_BIOMOL_NOTAS || "TU_ID_AQUI_BIO_MOL_NOTAS",
      sheetName: "Notas"
    }
  },
  TECNO_2: {
    asistencia: {
      spreadsheetId: import.meta.env.VITE_SHEET_ID_TECNOII_ASISTENCIA || "TU_ID_AQUI_TECNO_2_ASISTENCIA",
      sheetName: "Asistencia"
    },
    notas: {
      spreadsheetId: import.meta.env.VITE_SHEET_ID_TECNOII_NOTAS || "TU_ID_AQUI_TECNO_2_NOTAS",
      sheetName: "Notas"
    }
  },
  TECNO_3: {
    asistencia: {
      spreadsheetId: import.meta.env.VITE_SHEET_ID_TECNOIII_ASISTENCIA || "TU_ID_AQUI_TECNO_3_ASISTENCIA",
      sheetName: "Asistencia"
    },
    notas: {
      spreadsheetId: import.meta.env.VITE_SHEET_ID_TECNOIII_NOTAS || "TU_ID_AQUI_TECNO_3_NOTAS",
      sheetName: "Notas"
    }
  }
};
