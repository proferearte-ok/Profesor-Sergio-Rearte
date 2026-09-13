/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HistorialAlumno, CursadaItem, ExamenItem } from "../types";
import { isValidGoogleSheetId, normalizarTexto } from "./googleSheets";

/**
 * Normaliza nombres o consultas: texto en mayúsculas, sin tildes ni caracteres diacríticos,
 * sin puntuación y con espacios colapsados para comparaciones uniformes.
 */
export function normalizeStudentText(text: string): string {
  return (text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[,._\-\/\\()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Limpia y estandariza el legajo del estudiante (remueve sufijos decimales, espacios, etc.).
 */
export function cleanLegajo(val: any): string {
  if (val === null || val === undefined) return "";
  let s = String(val).trim();
  if (s.endsWith(".0")) {
    s = s.slice(0, -2);
  }
  const lower = s.toLowerCase();
  if (lower === "-" || lower === "0" || lower === "s/l" || lower === "s/d" || lower === "sin legajo") {
    return "";
  }
  return s;
}

/**
 * Parsea fechas en distintos formatos comunes de Google Sheets (DD/MM/YYYY, YYYY-MM-DD, Date(Y,M,D))
 * y retorna un timestamp numérico para ordenamiento cronológico.
 */
export function parseDateToTimestamp(fechaStr: string): number {
  if (!fechaStr) return 0;
  const str = fechaStr.trim();

  // Formato gviz: Date(year, monthIndex, day)
  const gvizMatch = str.match(/Date\((\d+),\s*(\d+),\s*(\d+)/);
  if (gvizMatch) {
    const y = parseInt(gvizMatch[1], 10);
    const m = parseInt(gvizMatch[2], 10);
    const d = parseInt(gvizMatch[3], 10);
    return new Date(y, m, d).getTime();
  }

  // Formato latino DD/MM/YYYY o DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    let year = parseInt(dmyMatch[3], 10);
    if (year < 100) year += 2000;
    return new Date(year, month, day).getTime();
  }

  // Formato ISO YYYY-MM-DD o YYYY/MM/DD
  const ymdMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    return new Date(year, month, day).getTime();
  }

  const parsed = Date.parse(str);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Extrae el año numérico para ordenar cursadas.
 */
export function parseAnioNumber(anioStr: string): number {
  if (!anioStr) return 0;
  const match = anioStr.match(/\d{4}/);
  if (match) return parseInt(match[0], 10);
  const fallback = parseInt(anioStr, 10);
  return isNaN(fallback) ? 0 : fallback;
}

/**
 * Normaliza el título de la materia para agrupar variantes leves de mayúsculas/minúsculas
 * conservando una presentación legible.
 */
function cleanMateriaName(materiaRaw: string): string {
  const trimmed = (materiaRaw || "").trim().replace(/\s+/g, " ");
  if (!trimmed) return "Materia Sin Especificar";
  return trimmed;
}

/**
 * Obtiene la matriz cruda de datos de una pestaña de Google Sheets usando gviz.
 */
async function fetchSheetTab(spreadsheetId: string, sheetName: string): Promise<{ headers: string[]; rows: string[][] }> {
  if (!isValidGoogleSheetId(spreadsheetId)) {
    throw new Error(`ID de planilla no válido: "${spreadsheetId}"`);
  }

  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    throw new Error(`Error de red al consultar la pestaña "${sheetName}" de Google Sheets.`);
  }

  if (!response.ok) {
    throw new Error(`Error HTTP al obtener pestaña "${sheetName}": ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  const startIdx = text.indexOf("({");
  const endIdx = text.lastIndexOf("})");

  if (startIdx === -1 || endIdx === -1) {
    throw new Error(`Respuesta no válida de Google Sheets para la pestaña "${sheetName}". Verifique los permisos de acceso público.`);
  }

  const jsonStr = text.substring(startIdx + 1, endIdx + 1);
  const json = JSON.parse(jsonStr);

  if (json.status === "error") {
    const errorMsg = json.errors?.[0]?.detailed_message || json.errors?.[0]?.message || "Error desconocido";
    throw new Error(`Error devuelto por Google Sheets en pestaña "${sheetName}": ${errorMsg}`);
  }

  const table = json.table;
  if (!table || !table.rows) {
    return { headers: [], rows: [] };
  }

  let headers: string[] = (table.cols || []).map((col: any) => (col && col.label ? String(col.label).trim() : ""));
  let rawRows: any[] = table.rows || [];

  // Si los encabezados de columnas vinieron vacíos, revisamos si la primera fila contiene los encabezados
  const allHeadersEmpty = headers.every((h) => !h || h.trim() === "");
  if (allHeadersEmpty && rawRows.length > 0) {
    const firstRow = rawRows[0];
    if (firstRow && firstRow.c) {
      headers = firstRow.c.map((cell: any) => {
        if (!cell) return "";
        return cell.f !== undefined && cell.f !== null
          ? String(cell.f).trim()
          : cell.v !== null && cell.v !== undefined
          ? String(cell.v).trim()
          : "";
      });
      rawRows = rawRows.slice(1);
    }
  }

  const rows: string[][] = rawRows.map((r: any) => {
    if (!r || !r.c) return [];
    return r.c.map((cell: any) => {
      if (!cell) return "";
      return cell.f !== undefined && cell.f !== null
        ? String(cell.f).trim()
        : cell.v !== null && cell.v !== undefined
        ? String(cell.v).trim()
        : "";
    });
  });

  return { headers, rows };
}

/**
 * Busca el índice de una columna comparando etiquetas normalizadas o utilizando un fallback por posición.
 */
function findColIndex(headers: string[], keywords: string[], fallbackIndex: number): number {
  if (headers.length > 0) {
    for (let i = 0; i < headers.length; i++) {
      const norm = normalizarTexto(headers[i]);
      for (const kw of keywords) {
        if (norm.includes(normalizarTexto(kw))) {
          return i;
        }
      }
    }
  }
  return fallbackIndex;
}

// Cache local en memoria para no reconsultar gviz en cada tipeo
let cachedStudents: HistorialAlumno[] | null = null;
let lastLoadedSheetId: string | null = null;

/**
 * Datos genéricos de demostración cuando la planilla aún no ha sido configurada
 * (cumpliendo con la regla de no inventar nombres reales de estudiantes).
 */
export const mockHistorialAlumnosDemo: HistorialAlumno[] = [
  {
    legajo: "1001",
    apellidoYNombre: "ESTUDIANTE DEMO A",
    porMateria: {
      "Biología Molecular": {
        cursadas: [
          {
            anio: "2024",
            condicion: "Promocionado",
            matchedBy: "legajo",
            carrera: "Licenciatura",
            nroActa: "ACT-2024-01",
            catedraOrigen: "Biología Molecular",
          },
        ],
        examenes: [
          {
            fecha: "18/12/2024",
            nota: "8",
            resultado: "Aprobado",
            materia: "Biología Molecular",
            carrera: "Licenciatura en Biotecnología",
            condicion: "Regular",
            nroActa: "FIN-2024-88",
            tipoActa: "Regular",
            turno: "Diciembre",
          },
        ],
      },
      "Tecnología de Laboratorio II": {
        cursadas: [
          {
            anio: "2025",
            condicion: "Regular",
            matchedBy: "nombre", // ⚠️ Demostración de cruce por nombre
            carrera: "Tecnicatura",
            catedraOrigen: "Tecno II",
          },
        ],
        examenes: [],
      },
    },
  },
  {
    legajo: "1002",
    apellidoYNombre: "ESTUDIANTE DEMO B",
    porMateria: {
      "Tecnología de Laboratorio III": {
        cursadas: [
          {
            anio: "2023",
            condicion: "Regular",
            matchedBy: "legajo",
            carrera: "Licenciatura",
          },
        ],
        examenes: [
          {
            fecha: "20/02/2024",
            nota: "9",
            resultado: "Aprobado",
            materia: "Tecnología de Laboratorio III",
            carrera: "Técnico Univ. de Laboratorio",
            condicion: "Regular",
            tipoActa: "Regular",
          },
        ],
      },
      "Biología Molecular": {
        cursadas: [],
        examenes: [
          {
            fecha: "05/07/2024",
            nota: "7",
            resultado: "Aprobado",
            materia: "Biología Molecular",
            carrera: "Licenciatura en Biotecnología",
            condicion: "Libre",
            tipoActa: "Libre",
          },
        ],
      },
    },
  },
  {
    legajo: "", // Estudiante sin legajo registrado (ej. cohorte 2024-2025)
    apellidoYNombre: "ESTUDIANTE DEMO C (SIN LEGAJO)",
    porMateria: {
      "Tecnología de Laboratorio II": {
        cursadas: [
          {
            anio: "2024",
            condicion: "Regular",
            matchedBy: "nombre",
            carrera: "Tecnicatura",
            catedraOrigen: "Tecno II",
          },
        ],
        examenes: [],
      },
    },
  },
];

/**
 * Lee ambas pestañas ("Datos Completos" y "Regularidad") de la planilla ACTAS_ANALISIS,
 * normaliza y cruza los registros de cursadas y exámenes de cada alumno.
 */
export async function getHistorialAlumnos(
  sheetIdOverride?: string,
  forceRefresh: boolean = false
): Promise<HistorialAlumno[]> {
  const sheetId = sheetIdOverride || import.meta.env.VITE_SHEET_ID_ACTAS_ANALISIS;

  if (!isValidGoogleSheetId(sheetId)) {
    // Si no está configurado el ID real, devolvemos los datos demo para pruebas visuales
    return mockHistorialAlumnosDemo;
  }

  if (cachedStudents && !forceRefresh && lastLoadedSheetId === sheetId) {
    return cachedStudents;
  }

  // 1. Obtener ambas pestañas en paralelo
  const [datosCompletosResult, regularidadResult] = await Promise.all([
    fetchSheetTab(sheetId, "Datos Completos"),
    fetchSheetTab(sheetId, "Regularidad"),
  ]);

  // 2. Mapear índices de columnas para "Datos Completos" (Exámenes)
  // Anio Carpeta | Archivo | N Acta | Tipo Acta | Anio Academico | Fecha Examen | Turno | Materia | Carrera | Docentes | DNI | Legajo | Apellido y Nombre | Condicion | Nota | Resultado | Concepto | Fuente
  const dcHeaders = datosCompletosResult.headers;
  const colDcLegajo = findColIndex(dcHeaders, ["legajo"], 11);
  const colDcNombre = findColIndex(dcHeaders, ["apellido y nombre", "apellido", "nombre", "alumno", "estudiante"], 12);
  const colDcMateria = findColIndex(dcHeaders, ["materia", "asignatura"], 7);
  const colDcFecha = findColIndex(dcHeaders, ["fecha examen", "fecha"], 5);
  const colDcNota = findColIndex(dcHeaders, ["nota", "calificacion"], 14);
  const colDcResultado = findColIndex(dcHeaders, ["resultado"], 15);
  const colDcCondicion = findColIndex(dcHeaders, ["condicion"], 13);
  const colDcNActa = findColIndex(dcHeaders, ["n acta", "nro acta", "acta"], 2);
  const colDcTipoActa = findColIndex(dcHeaders, ["tipo acta", "tipo"], 3);
  const colDcTurno = findColIndex(dcHeaders, ["turno"], 6);
  const colDcCarrera = findColIndex(dcHeaders, ["carrera"], 8);

  // 3. Mapear índices de columnas para "Regularidad" (Cursadas)
  // Legajo | Apellido y Nombre | Materia | Anio Cursada | Condicion | Carrera | Nro Acta | Catedra Origen | Fuente
  const regHeaders = regularidadResult.headers;
  const colRegLegajo = findColIndex(regHeaders, ["legajo"], 0);
  const colRegNombre = findColIndex(regHeaders, ["apellido y nombre", "apellido", "nombre", "alumno", "estudiante"], 1);
  const colRegMateria = findColIndex(regHeaders, ["materia", "asignatura"], 2);
  const colRegAnio = findColIndex(regHeaders, ["anio cursada", "ano cursada", "cursada", "anio", "ano"], 3);
  const colRegCondicion = findColIndex(regHeaders, ["condicion", "regularidad", "estado"], 4);
  const colRegCarrera = findColIndex(regHeaders, ["carrera"], 5);
  const colRegNroActa = findColIndex(regHeaders, ["nro acta", "n acta", "acta"], 6);
  const colRegCatedraOrigen = findColIndex(regHeaders, ["catedra origen", "catedra", "origen"], 7);

  // 4. PASO 1 DE CONCILIACIÓN: Construir diccionario de correspondencia (Nombre Normalizado -> Legajo Conocido)
  // Esto permite que si un alumno aparece en Regularidad con legajo vacío, pero tiene legajo en Datos Completos
  // o en otra fila de Regularidad, se le asigne su legajo automáticamente.
  const normalizedNameToLegajo = new Map<string, string>();
  const legajoToBestName = new Map<string, string>();

  // Analizar Datos Completos para emparejar
  for (const row of datosCompletosResult.rows) {
    const leg = cleanLegajo(row[colDcLegajo]);
    const name = (row[colDcNombre] || "").trim();
    const norm = normalizeStudentText(name);
    if (leg && norm) {
      normalizedNameToLegajo.set(norm, leg);
      if (!legajoToBestName.has(leg)) {
        legajoToBestName.set(leg, name);
      }
    }
  }

  // Analizar Regularidad para emparejar filas que sí tienen legajo
  for (const row of regularidadResult.rows) {
    const leg = cleanLegajo(row[colRegLegajo]);
    const name = (row[colRegNombre] || "").trim();
    const norm = normalizeStudentText(name);
    if (leg && norm) {
      normalizedNameToLegajo.set(norm, leg);
      if (!legajoToBestName.has(leg)) {
        legajoToBestName.set(leg, name);
      }
    }
  }

  // 5. PASO 2: Estructura unificada por alumno
  const studentsMap = new Map<string, HistorialAlumno>();

  function getOrCreateStudent(legajoInput: string, nombreInput: string): { student: HistorialAlumno; key: string } {
    const norm = normalizeStudentText(nombreInput);
    let resolvedLegajo = cleanLegajo(legajoInput);

    // Si no tiene legajo, revisar si conocemos su legajo por su nombre normalizado
    if (!resolvedLegajo && norm && normalizedNameToLegajo.has(norm)) {
      resolvedLegajo = normalizedNameToLegajo.get(norm)!;
    }

    // Clave unívoca en el mapa: por legajo si existe, o por nombre normalizado si nunca tuvo legajo
    const key = resolvedLegajo ? `LEG_${resolvedLegajo}` : `NAME_${norm}`;

    let student = studentsMap.get(key);
    if (!student) {
      const displayName = nombreInput.trim() || (resolvedLegajo ? legajoToBestName.get(resolvedLegajo) || `Legajo ${resolvedLegajo}` : "Estudiante");
      student = {
        legajo: resolvedLegajo,
        apellidoYNombre: displayName,
        porMateria: {},
      };
      studentsMap.set(key, student);
    } else if (resolvedLegajo && !student.legajo) {
      student.legajo = resolvedLegajo;
    }
    return { student, key };
  }

  // A. Procesar Exámenes ("Datos Completos")
  for (const row of datosCompletosResult.rows) {
    const rawLegajo = row[colDcLegajo];
    const rawNombre = row[colDcNombre];
    const rawMateria = row[colDcMateria];

    // Descartar filas vacías
    if (!rawLegajo && !rawNombre && !rawMateria) continue;

    const { student } = getOrCreateStudent(rawLegajo, rawNombre);
    const materia = cleanMateriaName(rawMateria);

    if (!student.porMateria[materia]) {
      student.porMateria[materia] = { cursadas: [], examenes: [] };
    }

    const fecha = (row[colDcFecha] || "").trim();
    const nota = (row[colDcNota] || "").trim();
    const resultado = (row[colDcResultado] || "").trim();
    const condicion = (row[colDcCondicion] || "").trim();
    const nroActa = (row[colDcNActa] || "").trim();
    const tipoActa = (row[colDcTipoActa] || "").trim();
    const turno = (row[colDcTurno] || "").trim();
    const carrera = (row[colDcCarrera] || "").trim();
    const materiaFila = (rawMateria || "").trim();

    // Solo agregar si hay algún dato de examen
    if (fecha || nota || resultado || nroActa) {
      student.porMateria[materia].examenes.push({
        fecha,
        nota,
        resultado,
        materia: materiaFila || materia,
        carrera: carrera || undefined,
        condicion: condicion || undefined,
        nroActa: nroActa || undefined,
        tipoActa: tipoActa || undefined,
        turno: turno || undefined,
      });
    }
  }

  // B. Procesar Cursadas ("Regularidad")
  for (const row of regularidadResult.rows) {
    const rawLegajo = row[colRegLegajo];
    const rawNombre = row[colRegNombre];
    const rawMateria = row[colRegMateria];

    // Descartar filas vacías
    if (!rawLegajo && !rawNombre && !rawMateria) continue;

    const cleanLeg = cleanLegajo(rawLegajo);
    const { student } = getOrCreateStudent(rawLegajo, rawNombre);
    const materia = cleanMateriaName(rawMateria);

    if (!student.porMateria[materia]) {
      student.porMateria[materia] = { cursadas: [], examenes: [] };
    }

    // Flag de cruce: si la fila de regularidad no traía legajo, fue cruzada por nombre
    const matchedBy: "legajo" | "nombre" = cleanLeg ? "legajo" : "nombre";

    const anio = (row[colRegAnio] || "").trim();
    const condicion = (row[colRegCondicion] || "").trim();
    const carrera = (row[colRegCarrera] || "").trim();
    const nroActa = (row[colRegNroActa] || "").trim();
    const catedraOrigen = (row[colRegCatedraOrigen] || "").trim();

    if (anio || condicion) {
      student.porMateria[materia].cursadas.push({
        anio,
        condicion,
        matchedBy,
        carrera: carrera || undefined,
        nroActa: nroActa || undefined,
        catedraOrigen: catedraOrigen || undefined,
      });
    }
  }

  // 6. Ordenar cursadas y exámenes cronológicamente (más reciente primero)
  for (const student of studentsMap.values()) {
    for (const matKey of Object.keys(student.porMateria)) {
      const mat = student.porMateria[matKey];

      // Ordenar cursadas por año descendente
      mat.cursadas.sort((a, b) => {
        const yA = parseAnioNumber(a.anio);
        const yB = parseAnioNumber(b.anio);
        return yB - yA;
      });

      // Ordenar exámenes por fecha descendente
      mat.examenes.sort((a, b) => {
        const tA = parseDateToTimestamp(a.fecha);
        const tB = parseDateToTimestamp(b.fecha);
        return tB - tA;
      });
    }
  }

  // 7. Convertir mapa a lista y ordenar alfabéticamente por Apellido y Nombre
  const result = Array.from(studentsMap.values()).sort((a, b) => {
    return a.apellidoYNombre.localeCompare(b.apellidoYNombre, "es", { sensitivity: "base" });
  });

  cachedStudents = result;
  lastLoadedSheetId = sheetId;
  return result;
}

/**
 * Busca alumnos en el listado cargado:
 * a) Si la consulta es puramente numérica, busca por LEGAJO (coincidencia exacta prioritaria y por prefijo).
 * b) Si no, busca por NOMBRE (coincidencia parcial normalizada, sin tildes ni mayúsculas).
 */
export function buscarAlumno(query: string, dataset?: HistorialAlumno[]): HistorialAlumno[] {
  const trimmed = (query || "").trim();
  if (trimmed.length < 2) {
    return [];
  }

  const list = dataset || cachedStudents || [];
  const isNumeric = /^\d+$/.test(trimmed);

  if (isNumeric) {
    const targetLegajo = cleanLegajo(trimmed);

    // 1. Coincidencia exacta por legajo
    const exactMatches = list.filter((s) => cleanLegajo(s.legajo) === targetLegajo);
    if (exactMatches.length > 0) {
      return exactMatches;
    }

    // 2. Si no hay coincidencia exacta aún (docente tipeando), autocompletar por prefijo de legajo
    return list.filter((s) => {
      const leg = cleanLegajo(s.legajo);
      return leg && leg.startsWith(targetLegajo);
    });
  }

  // Búsqueda por Nombre (coincidencia parcial normalizada)
  const normQuery = normalizeStudentText(trimmed);
  const queryTokens = normQuery.split(" ").filter((t) => t.length > 0);

  return list.filter((student) => {
    const normName = normalizeStudentText(student.apellidoYNombre);

    // Si la cadena completa está contenida
    if (normName.includes(normQuery)) {
      return true;
    }

    // O si todas las palabras buscadas están presentes en el nombre del estudiante
    if (queryTokens.length > 1) {
      return queryTokens.every((token) => normName.includes(token));
    }

    return false;
  });
}
