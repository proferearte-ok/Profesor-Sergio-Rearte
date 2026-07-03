/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Asistencia, NotaNum, NotaStatus, Catedra, SeccionEstado, Archivo } from "../types";

/**
 * Consulta la API de Visualización de Google para una planilla y pestaña dada y extrae la tabla de filas.
 * Soporta de manera transparente el formato JSONP devuelto por la API.
 */
async function fetchGoogleSheetRows(spreadsheetId: string, sheetName: string): Promise<any> {
  let url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  
  let response;
  try {
    response = await fetch(url);
  } catch (netErr) {
    throw new Error("Error de red al conectar con Google Sheets. Verifica tu conexión.");
  }

  let text = "";
  if (response.ok) {
    text = await response.text();
  }

  // Si no fue exitoso o el texto indica un error de que no se encontró la pestaña, intentamos con la primera pestaña por defecto
  let isError = !response.ok;
  if (response.ok) {
    const startIdx = text.indexOf("({");
    const endIdx = text.lastIndexOf("})");
    if (startIdx !== -1 && endIdx !== -1) {
      const jsonStr = text.substring(startIdx + 1, endIdx + 1);
      const json = JSON.parse(jsonStr);
      if (json.status === "error") {
        isError = true;
      }
    } else {
      isError = true;
    }
  }

  if (isError) {
    // Reintentar sin especificar el nombre de la pestaña (trae la primera pestaña por defecto)
    const fallbackUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json`;
    const fallbackResponse = await fetch(fallbackUrl);
    if (!fallbackResponse.ok) {
      throw new Error(`Error al obtener la planilla de Google Sheets: ${fallbackResponse.status} ${fallbackResponse.statusText}`);
    }
    text = await fallbackResponse.text();
  }
  
  // La respuesta viene con formato: /*O_o*/\ngoogle.visualization.Query.setResponse({ ... });
  const startIdx = text.indexOf("({");
  const endIdx = text.lastIndexOf("})");
  
  if (startIdx === -1 || endIdx === -1) {
    throw new Error("El formato de respuesta de Google Sheets no es válido. ¿Está la planilla compartida de forma pública con cualquier persona?");
  }
  
  const jsonStr = text.substring(startIdx + 1, endIdx + 1);
  const json = JSON.parse(jsonStr);
  
  if (json.status === "error") {
    const errorMsg = json.errors?.[0]?.detailed_message || json.errors?.[0]?.message || "Error desconocido";
    throw new Error(`Google Sheets reportó un error: ${errorMsg}`);
  }
  
  if (!json.table || !json.table.cols || !json.table.rows) {
    throw new Error("La planilla no contiene una tabla de datos válida o está vacía.");
  }
  
  return json.table;
}

/**
 * Obtiene y mapea el listado de asistencia desde Google Sheets.
 */
export async function getAsistenciaFromSheet(
  spreadsheetId: string, 
  sheetName: string, 
  idCatedra: string,
  anioVigente: number = 2026
): Promise<Asistencia[]> {
  try {
    const table = await fetchGoogleSheetRows(spreadsheetId, sheetName);
    const cols = table.cols;
    const rows = table.rows;

    // Encontrar índices de columnas por label de manera tolerante
    let colIndexEstudiante = -1;
    let colIndexAsistencia = -1;
    let colIndexAnio = -1;

    cols.forEach((col: any, index: number) => {
      const label = (col.label || "").toLowerCase().trim();
      if (label.includes("estudiante") || label.includes("apellido") || label.includes("nombre") || label.includes("alumno")) {
        colIndexEstudiante = index;
      } else if (label.includes("asistencia") || label.includes("%") || label.includes("total")) {
        colIndexAsistencia = index;
      } else if (label.includes("anio") || label.includes("año")) {
        colIndexAnio = index;
      }
    });

    // Fallbacks si no se detectan por cabecera
    if (colIndexEstudiante === -1) colIndexEstudiante = 0;
    if (colIndexAsistencia === -1) colIndexAsistencia = cols.length > 1 ? 1 : 0;

    return rows.map((row: any) => {
      const c = row.c || [];
      const valEstudiante = c[colIndexEstudiante]?.v || "";
      if (valEstudiante === null || valEstudiante === undefined || String(valEstudiante).trim() === "") {
        return null;
      }
      
      // Formatear asistencia de forma robusta
      let valAsistencia = "0%";
      const cellAsistencia = c[colIndexAsistencia];
      if (cellAsistencia) {
        if (cellAsistencia.f) {
          valAsistencia = cellAsistencia.f;
        } else if (typeof cellAsistencia.v === "number") {
          const pctVal = cellAsistencia.v <= 1 ? cellAsistencia.v * 100 : cellAsistencia.v;
          valAsistencia = `${Math.round(pctVal)}%`;
        } else if (cellAsistencia.v !== null && cellAsistencia.v !== undefined) {
          valAsistencia = String(cellAsistencia.v);
          if (!valAsistencia.includes("%") && !isNaN(Number(valAsistencia))) {
            valAsistencia = `${valAsistencia}%`;
          }
        }
      }

      const valAnio = colIndexAnio !== -1 && c[colIndexAnio] && c[colIndexAnio].v !== null ? Number(c[colIndexAnio].v) : anioVigente;

      return {
        id_catedra: idCatedra,
        anio: isNaN(valAnio) ? anioVigente : valAnio,
        estudiante: String(valEstudiante).trim(),
        porcentaje: valAsistencia
      };
    }).filter(Boolean) as Asistencia[];
  } catch (error) {
    console.error("Error en getAsistenciaFromSheet:", error);
    throw error;
  }
}

/**
 * Obtiene y mapea el esquema numérico de notas (Biología Molecular y Tecno II).
 */
export async function getNotasNumFromSheet(
  spreadsheetId: string,
  sheetName: string,
  idCatedra: string,
  anioVigente: number = 2026
): Promise<NotaNum[]> {
  try {
    const table = await fetchGoogleSheetRows(spreadsheetId, sheetName);
    const cols = table.cols;
    const rows = table.rows;

    let idxEstudiante = -1;
    let idxP1Teoria = -1;
    let idxP1Practica = -1;
    let idxP1Resultado = -1;
    let idxP2Teoria = -1;
    let idxP2Practica = -1;
    let idxP2Resultado = -1;
    let idxRecupera = -1;
    let idxRecTeoria = -1;
    let idxRecPractica = -1;
    let idxRecResultado = -1;
    let idxCondicionFinal = -1;
    let idxAnio = -1;

    cols.forEach((col: any, index: number) => {
      const label = (col.label || "").toLowerCase().trim();
      
      if (label.includes("estudiante") || label.includes("apellido") || label.includes("nombre") || label.includes("alumno")) {
        idxEstudiante = index;
      } else if (label.includes("p1") || label.includes("primer parcial") || label.includes("1er parcial") || label.includes("parcial 1") || label.includes("parcial1")) {
        if (label.includes("teor")) idxP1Teoria = index;
        else if (label.includes("pract") || label.includes("práct")) idxP1Practica = index;
        else if (label.includes("res") || label.includes("condic") || label.includes("estado")) idxP1Resultado = index;
      } else if (label.includes("p2") || label.includes("segundo parcial") || label.includes("2do parcial") || label.includes("parcial 2") || label.includes("parcial2")) {
        if (label.includes("teor")) idxP2Teoria = index;
        else if (label.includes("pract") || label.includes("práct")) idxP2Practica = index;
        else if (label.includes("res") || label.includes("condic") || label.includes("estado")) idxP2Resultado = index;
      } else if (label.includes("recupera") && !label.includes("teor") && !label.includes("pract") && !label.includes("res")) {
        idxRecupera = index;
      } else if (label.includes("rec") || label.includes("recup")) {
        if (label.includes("teor")) idxRecTeoria = index;
        else if (label.includes("pract") || label.includes("práct")) idxRecPractica = index;
        else if (label.includes("res") || label.includes("condic") || label.includes("estado")) idxRecResultado = index;
      } else if (label.includes("condición final") || label.includes("condicion final") || label.includes("final")) {
        idxCondicionFinal = index;
      } else if (label.includes("anio") || label.includes("año")) {
        idxAnio = index;
      }
    });

    // Fallback de índice
    if (idxEstudiante === -1) idxEstudiante = 0;

    const getCellValue = (c: any[], index: number, isPercent: boolean = false): string => {
      if (index === -1 || !c[index]) return "-";
      const cell = c[index];
      if (cell.f) return cell.f;
      if (cell.v === null || cell.v === undefined) return "-";
      if (isPercent && typeof cell.v === "number") {
        const pctVal = cell.v <= 1 ? cell.v * 100 : cell.v;
        return `${Math.round(pctVal)}%`;
      }
      return String(cell.v);
    };

    return rows.map((row: any) => {
      const c = row.c || [];
      const valEstudiante = getCellValue(c, idxEstudiante);
      if (valEstudiante === "-" || valEstudiante.trim() === "") return null;

      const valAnio = idxAnio !== -1 && c[idxAnio] && c[idxAnio].v !== null ? Number(c[idxAnio].v) : anioVigente;

      return {
        id_catedra: idCatedra,
        anio: isNaN(valAnio) ? anioVigente : valAnio,
        estudiante: valEstudiante.trim(),
        p1_teoria: getCellValue(c, idxP1Teoria, true),
        p1_practica: getCellValue(c, idxP1Practica, true),
        p1_resultado: getCellValue(c, idxP1Resultado),
        p2_teoria: getCellValue(c, idxP2Teoria, true),
        p2_practica: getCellValue(c, idxP2Practica, true),
        p2_resultado: getCellValue(c, idxP2Resultado),
        recupera: getCellValue(c, idxRecupera),
        rec_teoria: getCellValue(c, idxRecTeoria, true),
        rec_practica: getCellValue(c, idxRecPractica, true),
        rec_resultado: getCellValue(c, idxRecResultado),
        condicion_final: getCellValue(c, idxCondicionFinal)
      };
    }).filter(Boolean) as NotaNum[];
  } catch (error) {
    console.error("Error en getNotasNumFromSheet:", error);
    throw error;
  }
}

/**
 * Obtiene y mapea el esquema cualitativo de notas (Tecno III).
 */
export async function getNotasStatusFromSheet(
  spreadsheetId: string,
  sheetName: string,
  idCatedra: string,
  anioVigente: number = 2026
): Promise<NotaStatus[]> {
  try {
    const table = await fetchGoogleSheetRows(spreadsheetId, sheetName);
    const cols = table.cols;
    const rows = table.rows;

    let idxEstudiante = -1;
    let idxP1Teoria = -1;
    let idxP1Condicion = -1;
    let idxP2Teoria = -1;
    let idxP2Condicion = -1;
    let idxRecTeoria = -1;
    let idxRecCondicion = -1;
    let idxPractica = -1;
    let idxCondicionFinal = -1;
    let idxAnio = -1;

    cols.forEach((col: any, index: number) => {
      const label = (col.label || "").toLowerCase().trim();

      if (label.includes("estudiante") || label.includes("apellido") || label.includes("nombre") || label.includes("alumno")) {
        idxEstudiante = index;
      } else if (label.includes("p1") || label.includes("primer parcial") || label.includes("1er parcial") || label.includes("parcial 1") || label.includes("parcial1")) {
        if (label.includes("teor")) idxP1Teoria = index;
        else if (label.includes("condic") || label.includes("estado") || label.includes("result") || label.includes("resultado")) idxP1Condicion = index;
      } else if (label.includes("p2") || label.includes("segundo parcial") || label.includes("2do parcial") || label.includes("parcial 2") || label.includes("parcial2")) {
        if (label.includes("teor")) idxP2Teoria = index;
        else if (label.includes("condic") || label.includes("estado") || label.includes("result") || label.includes("resultado")) idxP2Condicion = index;
      } else if (label.includes("recupera") || label.includes("recup")) {
        if (label.includes("teor")) idxRecTeoria = index;
        else if (label.includes("condic") || label.includes("estado") || label.includes("result") || label.includes("resultado")) idxRecCondicion = index;
      } else if (label.includes("práctica") || label.includes("practica") || label.includes("proyecto") || label.includes("entregas")) {
        idxPractica = index;
      } else if (label.includes("condición final") || label.includes("condicion final") || label.includes("final")) {
        idxCondicionFinal = index;
      } else if (label.includes("anio") || label.includes("año")) {
        idxAnio = index;
      }
    });

    if (idxEstudiante === -1) idxEstudiante = 0;

    const getCellValue = (c: any[], index: number, isPercent: boolean = false): string => {
      if (index === -1 || !c[index]) return "-";
      const cell = c[index];
      if (cell.f) return cell.f;
      if (cell.v === null || cell.v === undefined) return "-";
      if (isPercent && typeof cell.v === "number") {
        const pctVal = cell.v <= 1 ? cell.v * 100 : cell.v;
        return `${Math.round(pctVal)}%`;
      }
      return String(cell.v);
    };

    return rows.map((row: any) => {
      const c = row.c || [];
      const valEstudiante = getCellValue(c, idxEstudiante);
      if (valEstudiante === "-" || valEstudiante.trim() === "") return null;

      const valAnio = idxAnio !== -1 && c[idxAnio] && c[idxAnio].v !== null ? Number(c[idxAnio].v) : anioVigente;

      return {
        id_catedra: idCatedra,
        anio: isNaN(valAnio) ? anioVigente : valAnio,
        estudiante: valEstudiante.trim(),
        p1_teoria: getCellValue(c, idxP1Teoria, true),
        p1_condicion: getCellValue(c, idxP1Condicion),
        p2_teoria: getCellValue(c, idxP2Teoria, true),
        p2_condicion: getCellValue(c, idxP2Condicion),
        rec_teoria: getCellValue(c, idxRecTeoria, true),
        rec_condicion: getCellValue(c, idxRecCondicion),
        practica: getCellValue(c, idxPractica),
        condicion_final: getCellValue(c, idxCondicionFinal)
      };
    }).filter(Boolean) as NotaStatus[];
  } catch (error) {
    console.error("Error en getNotasStatusFromSheet:", error);
    throw error;
  }
}

/**
 * Obtiene y mapea el listado de cátedras desde la pestaña "Catedras".
 */
export async function getCatedrasFromSheet(spreadsheetId: string): Promise<Catedra[]> {
  try {
    const table = await fetchGoogleSheetRows(spreadsheetId, "Catedras");
    const cols = table.cols;
    const rows = table.rows;

    let idxId = -1;
    let idxNombre = -1;
    let idxCuatrimestre = -1;
    let idxActiva = -1;
    let idxAnioVigente = -1;

    cols.forEach((col: any, index: number) => {
      const label = (col.label || "").toLowerCase().trim();
      if (label.includes("id_catedra") || label.includes("id") || label.includes("catedra")) {
        idxId = index;
      } else if (label.includes("nombre")) {
        idxNombre = index;
      } else if (label.includes("cuatrimestre") || label.includes("cuatri")) {
        idxCuatrimestre = index;
      } else if (label.includes("activa")) {
        idxActiva = index;
      } else if (label.includes("anio_vigente") || label.includes("año") || label.includes("vigente")) {
        idxAnioVigente = index;
      }
    });

    if (idxId === -1) idxId = 0;

    const getVal = (c: any[], idx: number): string => {
      if (idx === -1 || !c[idx] || c[idx].v === null || c[idx].v === undefined) return "";
      return String(c[idx].v).trim();
    };

    return rows.map((row: any) => {
      const c = row.c || [];
      const id = getVal(c, idxId);
      if (!id) return null;

      const activaVal = getVal(c, idxActiva).toLowerCase();
      const activa = activaVal === "true" || activaVal === "si" || activaVal === "sí" || activaVal === "1" || activaVal === "yes" || activaVal === "active";

      const anioVal = Number(getVal(c, idxAnioVigente));

      return {
        id,
        nombre: getVal(c, idxNombre) || id,
        cuatrimestre: getVal(c, idxCuatrimestre) || "1er Cuatrimestre",
        activa,
        anio_vigente: isNaN(anioVal) || anioVal === 0 ? 2026 : anioVal,
        tipo_cronograma: "TEXTO_SIMPLE",
        contenido_cronograma: ""
      };
    }).filter(Boolean) as Catedra[];
  } catch (error) {
    console.error("Error en getCatedrasFromSheet:", error);
    throw error;
  }
}

/**
 * Obtiene y mapea el estado de activación de las secciones desde la pestaña "Secciones".
 */
export async function getSeccionesFromSheet(spreadsheetId: string): Promise<any[]> {
  try {
    const table = await fetchGoogleSheetRows(spreadsheetId, "Secciones");
    const cols = table.cols;
    const rows = table.rows;

    let idxCatedra = -1;
    let idxSeccion = -1;
    let idxEstado = -1;
    let idxTextoSimple = -1;
    let idxTipoCronograma = -1;
    let idxContenidoCronograma = -1;

    cols.forEach((col: any, index: number) => {
      const label = (col.label || "").toLowerCase().trim();
      if (label.includes("id_catedra") || label.includes("id") || label.includes("catedra")) {
        idxCatedra = index;
      } else if (label.includes("seccion") || label.includes("sección")) {
        idxSeccion = index;
      } else if (label.includes("estado")) {
        idxEstado = index;
      } else if (label.includes("texto_simple") || label.includes("texto") || label.includes("contenido")) {
        idxTextoSimple = index;
      } else if (label.includes("tipo_cronograma") || label.includes("tipo_crono") || label.includes("tipo cronograma")) {
        idxTipoCronograma = index;
      } else if (label.includes("contenido_cronograma") || label.includes("contenido_crono") || label.includes("contenido cronograma")) {
        idxContenidoCronograma = index;
      }
    });

    if (idxCatedra === -1) idxCatedra = 0;
    if (idxSeccion === -1) idxSeccion = 1;

    const getVal = (c: any[], idx: number): string => {
      if (idx === -1 || !c[idx] || c[idx].v === null || c[idx].v === undefined) return "";
      return String(c[idx].v).trim();
    };

    return rows.map((row: any) => {
      const c = row.c || [];
      const id_catedra = getVal(c, idxCatedra);
      const seccion = getVal(c, idxSeccion);
      if (!id_catedra || !seccion) return null;

      const estadoVal = getVal(c, idxEstado).toLowerCase();
      const estado: "Activa" | "Inactiva" = (estadoVal === "activa" || estadoVal === "true" || estadoVal === "si" || estadoVal === "sí" || estadoVal === "1" || estadoVal === "active") ? "Activa" : "Inactiva";

      return {
        id_catedra,
        seccion,
        estado,
        texto_simple: getVal(c, idxTextoSimple),
        tipo_cronograma: getVal(c, idxTipoCronograma),
        contenido_cronograma: getVal(c, idxContenidoCronograma)
      };
    }).filter(Boolean);
  } catch (error) {
    console.error("Error en getSeccionesFromSheet:", error);
    throw error;
  }
}

/**
 * Obtiene y mapea el listado de archivos compartidos desde la pestaña "Archivos".
 */
export async function getArchivosFromSheet(spreadsheetId: string): Promise<Archivo[]> {
  try {
    const table = await fetchGoogleSheetRows(spreadsheetId, "Archivos");
    const cols = table.cols;
    const rows = table.rows;

    let idxCatedra = -1;
    let idxTipoSeccion = -1;
    let idxNombreArchivo = -1;
    let idxLinkDrive = -1;
    let idxOrden = -1;
    let idxFechaSubida = -1;

    cols.forEach((col: any, index: number) => {
      const label = (col.label || "").toLowerCase().trim();
      if (label.includes("id_catedra") || label.includes("id") || label.includes("catedra")) {
        idxCatedra = index;
      } else if (label.includes("tipo_seccion") || label.includes("tipo") || label.includes("seccion")) {
        idxTipoSeccion = index;
      } else if (label.includes("nombre_archivo") || label.includes("nombre") || label.includes("archivo") || label.includes("titulo")) {
        idxNombreArchivo = index;
      } else if (label.includes("link_drive") || label.includes("link") || label.includes("drive") || label.includes("url")) {
        idxLinkDrive = index;
      } else if (label.includes("orden")) {
        idxOrden = index;
      } else if (label.includes("fecha_subida") || label.includes("fecha") || label.includes("subida")) {
        idxFechaSubida = index;
      }
    });

    if (idxCatedra === -1) idxCatedra = 0;

    const getVal = (c: any[], idx: number): string => {
      if (idx === -1 || !c[idx] || c[idx].v === null || c[idx].v === undefined) return "";
      return String(c[idx].v).trim();
    };

    return rows.map((row: any) => {
      const c = row.c || [];
      const id_catedra = getVal(c, idxCatedra);
      if (!id_catedra) return null;

      const rawTipo = getVal(c, idxTipoSeccion);
      let tipo_seccion: "Bibliografia" | "Diapositivas" | "Apuntes_Clase" = "Bibliografia";
      
      const rawTipoLower = rawTipo.toLowerCase();
      if (rawTipoLower.includes("diapo") || rawTipoLower.includes("filminas") || rawTipoLower.includes("presentacion")) {
        tipo_seccion = "Diapositivas";
      } else if (rawTipoLower.includes("apunte") || rawTipoLower.includes("clase") || rawTipoLower.includes("guia") || rawTipoLower.includes("guía") || rawTipoLower.includes("practico") || rawTipoLower.includes("práctico")) {
        tipo_seccion = "Apuntes_Clase";
      } else {
        tipo_seccion = "Bibliografia";
      }

      const ordenVal = Number(getVal(c, idxOrden));

      return {
        id_catedra,
        tipo_seccion,
        nombre_archivo: getVal(c, idxNombreArchivo) || "Archivo sin título",
        link_drive: getVal(c, idxLinkDrive) || "#",
        orden: isNaN(ordenVal) || ordenVal === 0 ? 1 : ordenVal,
        fecha_subida: getVal(c, idxFechaSubida) || new Date().toLocaleDateString("es-AR")
      };
    }).filter(Boolean) as Archivo[];
  } catch (error) {
    console.error("Error en getArchivosFromSheet:", error);
    throw error;
  }
}

