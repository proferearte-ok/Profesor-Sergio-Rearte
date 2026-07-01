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

/**
 * Configuración de IDs de planillas de Google Sheets por cátedra.
 * Reemplazar "TU_ID_AQUI_..." con los IDs reales de tus planillas de Google Sheets.
 * Asegúrate de que las planillas estén compartidas como "Cualquier persona con el enlace puede ver".
 */
export const SHEETS_CONFIG: Record<string, CatedraSheets> = {
  BIO_MOL: {
    asistencia: {
      spreadsheetId: "1c88VjGIy4oudX8cFx_fXnKwyOqpsD9eQIEufyfvhRMk",
      sheetName: "Asistencia"
    },
    notas: {
      spreadsheetId: "1zjHKtxRk6jA81a1t4Jd01I0Yo9Dl64le4mJO4snAmCI",
      sheetName: "Notas"
    }
  },
  TECNO_2: {
    asistencia: {
      spreadsheetId: "16lzzMVQtUhC9O2OdgJlJ2tnUJdYYbuOrHnX5SwDNfkw",
      sheetName: "Asistencia"
    },
    notas: {
      spreadsheetId: "1RLVS6zk6rZatHBWkhKPnWKgWvT5J0Xh5--II_E1r47c",
      sheetName: "Notas"
    }
  },
  TECNO_3: {
    asistencia: {
      spreadsheetId: "1WSoB6xofiOm85m_PpOqpde45MccV8eHRgNjwbDBAA18",
      sheetName: "Asistencia"
    },
    notas: {
      spreadsheetId: "1MRHghDMw7_C6VgY1JYZeUKERvhLFFRXjTw5CETHYEOM",
      sheetName: "Notas"
    }
  }
};
