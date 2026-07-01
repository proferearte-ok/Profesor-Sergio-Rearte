/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  Info, 
  Eye, 
  BookOpen, 
  Paperclip, 
  ExternalLink, 
  Users,
  Loader2,
  AlertTriangle,
  RefreshCw,
  CheckCircle2
} from "lucide-react";
import { 
  mockCatedras, 
  mockSecciones, 
  mockArchivos, 
  mockAsistencia, 
  mockNotasNum, 
  mockNotasStatus 
} from "../data/mockData";
import { SHEETS_CONFIG } from "../config/sheets";
import { 
  getAsistenciaFromSheet, 
  getNotasNumFromSheet, 
  getNotasStatusFromSheet 
} from "../services/googleSheets";
import { Asistencia, NotaNum, NotaStatus } from "../types";

/**
 * Componente que renderiza la pestaña del Visualizador de Hojas de Datos.
 * Contiene la simulación de las planillas de Google Sheets y el simulador de portal web (vista estudiante).
 */
export default function VisualizerTab() {
  const [selectedCatedra, setSelectedCatedra] = useState<string>("BIO_MOL");
  const [selectedSheet, setSelectedSheet] = useState<string>("catedras");

  // Dynamic state for Sheets
  const [asistencia, setAsistencia] = useState<Asistencia[]>([]);
  const [notasNum, setNotasNum] = useState<NotaNum[]>([]);
  const [notasStatus, setNotasStatus] = useState<NotaStatus[]>([]);

  const [loadingAsistencia, setLoadingAsistencia] = useState<boolean>(false);
  const [loadingNotas, setLoadingNotas] = useState<boolean>(false);

  const [errorAsistencia, setErrorAsistencia] = useState<string | null>(null);
  const [errorNotas, setErrorNotas] = useState<string | null>(null);

  const [isDemoMode, setIsDemoMode] = useState<{ asistencia: boolean; notas: boolean }>({
    asistencia: true,
    notas: true,
  });

  const loadSheetsData = async () => {
    const config = SHEETS_CONFIG[selectedCatedra];
    if (!config) return;

    const currentYear = mockCatedras.find(c => c.id === selectedCatedra)?.anio_vigente || 2026;

    // --- CARGA DE ASISTENCIA ---
    const isAsistenciaDemo = config.asistencia.spreadsheetId.startsWith("TU_ID_AQUI");
    if (isAsistenciaDemo) {
      setAsistencia(mockAsistencia.filter(a => a.id_catedra === selectedCatedra));
      setLoadingAsistencia(false);
      setErrorAsistencia(null);
      setIsDemoMode(prev => ({ ...prev, asistencia: true }));
    } else {
      setLoadingAsistencia(true);
      setErrorAsistencia(null);
      setIsDemoMode(prev => ({ ...prev, asistencia: false }));
      try {
        const data = await getAsistenciaFromSheet(
          config.asistencia.spreadsheetId,
          config.asistencia.sheetName,
          selectedCatedra,
          currentYear
        );
        setAsistencia(data);
      } catch (err: any) {
        setErrorAsistencia(err.message || "Sin datos de asistencia disponibles para este ciclo");
      } finally {
        setLoadingAsistencia(false);
      }
    }

    // --- CARGA DE NOTAS ---
    const isNotasDemo = config.notas.spreadsheetId.startsWith("TU_ID_AQUI");
    if (isNotasDemo) {
      if (selectedCatedra === "TECNO_3") {
        setNotasStatus(mockNotasStatus.filter(n => n.id_catedra === selectedCatedra));
      } else {
        setNotasNum(mockNotasNum.filter(n => n.id_catedra === selectedCatedra));
      }
      setLoadingNotas(false);
      setErrorNotas(null);
      setIsDemoMode(prev => ({ ...prev, notas: true }));
    } else {
      setLoadingNotas(true);
      setErrorNotas(null);
      setIsDemoMode(prev => ({ ...prev, notas: false }));
      try {
        if (selectedCatedra === "TECNO_3") {
          const data = await getNotasStatusFromSheet(
            config.notas.spreadsheetId,
            config.notas.sheetName,
            selectedCatedra,
            currentYear
          );
          setNotasStatus(data);
        } else {
          const data = await getNotasNumFromSheet(
            config.notas.spreadsheetId,
            config.notas.sheetName,
            selectedCatedra,
            currentYear
          );
          setNotasNum(data);
        }
      } catch (err: any) {
        setErrorNotas(err.message || "Sin datos de calificaciones disponibles para este ciclo");
      } finally {
        setLoadingNotas(false);
      }
    }
  };

  useEffect(() => {
    loadSheetsData();
  }, [selectedCatedra]);


  return (
    <div className="space-y-6">
      {/* TITLE AND CATEDRA SELECTOR */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-semibold text-stone-900 text-lg">Simulación de Planillas del Docente</h3>
          <p className="text-xs text-stone-500 mt-1">
            Explorá el modelo exacto de tablas que el docente editará en Sheets. Cambiá la cátedra seleccionada para ver cómo se estructuran las notas según el esquema de evaluación.
          </p>
        </div>

        {/* SUBJECT AND TAB SELECTOR */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-mono text-stone-400 font-semibold mr-1">Filtrar Cátedra:</span>
          <button
            id="catedra-bio"
            onClick={() => {
              setSelectedCatedra("BIO_MOL");
              // If sheet is custom notes, reset to matching or general
              if (selectedSheet === "notas_status") setSelectedSheet("notas_num");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCatedra === "BIO_MOL"
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            Biología Molecular (Numérico)
          </button>
          <button
            id="catedra-tecno3"
            onClick={() => {
              setSelectedCatedra("TECNO_3");
              if (selectedSheet === "notas_num") setSelectedSheet("notas_status");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCatedra === "TECNO_3"
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            Tecno III (Status / Cualitativo)
          </button>
        </div>
      </div>

      {/* SPREADSHEET TABS SIMULATOR */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="bg-stone-50 border-b border-stone-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-600 font-mono text-xs">
            <span className="inline-block w-3 h-3 bg-green-600 rounded-full"></span>
            <span className="font-bold text-stone-700">catedra_db_plan docente.xlsx</span>
          </div>
          <span className="text-xs text-stone-400 font-mono">Modo: Previsualización de Esquema</span>
        </div>

        {/* SHEET HEADERS SELECTOR */}
        <div className="flex bg-[#F1EFE9] border-b border-stone-200 overflow-x-auto text-xs font-mono text-stone-600">
          <button
            id="sheet-catedras"
            onClick={() => setSelectedSheet("catedras")}
            className={`px-4 py-2 border-r border-stone-200 transition-all ${
              selectedSheet === "catedras" ? "bg-white text-stone-900 font-bold border-t-2 border-t-emerald-600" : "hover:bg-stone-100"
            }`}
          >
            📁 1. Cátedras
          </button>
          <button
            id="sheet-secciones"
            onClick={() => setSelectedSheet("secciones")}
            className={`px-4 py-2 border-r border-stone-200 transition-all ${
              selectedSheet === "secciones" ? "bg-white text-stone-900 font-bold border-t-2 border-t-emerald-600" : "hover:bg-stone-100"
            }`}
          >
            ⚙️ 2. Secciones_Estado
          </button>
          <button
            id="sheet-archivos"
            onClick={() => setSelectedSheet("archivos")}
            className={`px-4 py-2 border-r border-stone-200 transition-all ${
              selectedSheet === "archivos" ? "bg-white text-stone-900 font-bold border-t-2 border-t-emerald-600" : "hover:bg-stone-100"
            }`}
          >
            📎 3. Archivos
          </button>
          <button
            id="sheet-asistencia"
            onClick={() => setSelectedSheet("asistencia")}
            className={`px-4 py-2 border-r border-stone-200 transition-all ${
              selectedSheet === "asistencia" ? "bg-white text-stone-900 font-bold border-t-2 border-t-emerald-600" : "hover:bg-stone-100"
            }`}
          >
            📊 4. Asistencia
          </button>
          <button
            id="sheet-notas-num"
            onClick={() => setSelectedSheet("notas_num")}
            className={`px-4 py-2 border-r border-stone-200 transition-all ${
              selectedSheet === "notas_num" ? "bg-white text-stone-900 font-bold border-t-2 border-t-emerald-600" : "hover:bg-stone-100"
            } ${selectedCatedra === "TECNO_3" ? "opacity-40" : ""}`}
          >
            📝 5. Notas_Esquema_Num (Bio/Tec2)
          </button>
          <button
            id="sheet-notas-status"
            onClick={() => setSelectedSheet("notas_status")}
            className={`px-4 py-2 border-r border-stone-200 transition-all ${
              selectedSheet === "notas_status" ? "bg-white text-stone-900 font-bold border-t-2 border-t-emerald-600" : "hover:bg-stone-100"
            } ${selectedCatedra === "BIO_MOL" ? "opacity-40" : ""}`}
          >
            📝 6. Notas_Esquema_Status (Tec3)
          </button>
        </div>

        {/* SHEET CONTAINER & MOCK TABLE DISPLAY */}
        <div className="p-6 overflow-x-auto">
          {selectedSheet === "catedras" && (
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-stone-100 text-stone-700 uppercase">
                  <th className="p-3 border border-stone-200">ID_Catedra (PK)</th>
                  <th className="p-3 border border-stone-200">Nombre</th>
                  <th className="p-3 border border-stone-200">Cuatrimestre</th>
                  <th className="p-3 border border-stone-200">Activa (Vigencia)</th>
                  <th className="p-3 border border-stone-200">Anio_Vigente</th>
                  <th className="p-3 border border-stone-200">Tipo_Cronograma</th>
                  <th className="p-3 border border-stone-200">Contenido_Cronograma</th>
                </tr>
              </thead>
              <tbody>
                {mockCatedras.map((c) => (
                  <tr key={c.id} className={`hover:bg-amber-50/40 ${selectedCatedra === c.id ? "bg-amber-50/50 font-semibold" : ""}`}>
                    <td className="p-3 border border-stone-200 font-bold text-amber-800">{c.id}</td>
                    <td className="p-3 border border-stone-200">{c.nombre}</td>
                    <td className="p-3 border border-stone-200">{c.cuatrimestre}</td>
                    <td className="p-3 border border-stone-200">
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${c.activa ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-400"}`}>
                        {c.activa ? "SI (Activo)" : "NO (Inactivo)"}
                      </span>
                    </td>
                    <td className="p-3 border border-stone-200">{c.anio_vigente}</td>
                    <td className="p-3 border border-stone-200 text-blue-800 font-bold">{c.tipo_cronograma}</td>
                    <td className="p-3 border border-stone-200 truncate max-w-xs" title={c.contenido_cronograma}>{c.contenido_cronograma}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedSheet === "secciones" && (
            <div>
              <div className="mb-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Requisito 6 Soportado:</strong> Alumnos de <strong>{selectedCatedra === "BIO_MOL" ? "Biología Molecular" : "Tecno III"}</strong> verán que 
                  {selectedCatedra === "BIO_MOL" 
                    ? " todas sus secciones están activas." 
                    : " la sección 'Apuntes de Clase' figura inactiva, demostrando cómo el sistema de datos maneja secciones vacías sin romper el código."}
                </span>
              </div>
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 uppercase">
                    <th className="p-3 border border-stone-200">ID_Catedra (FK)</th>
                    <th className="p-3 border border-stone-200">Seccion</th>
                    <th className="p-3 border border-stone-200">Estado</th>
                    <th className="p-3 border border-stone-200">Texto_Simple (Opcional)</th>
                  </tr>
                </thead>
                <tbody>
                  {mockSecciones
                    .filter((s) => s.id_catedra === selectedCatedra)
                    .map((s, idx) => (
                      <tr key={idx} className="hover:bg-amber-50/40">
                        <td className="p-3 border border-stone-200 text-stone-500">{s.id_catedra}</td>
                        <td className="p-3 border border-stone-200 font-bold text-stone-800">{s.seccion}</td>
                        <td className="p-3 border border-stone-200">
                          <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${s.estado === "Activa" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                            {s.estado}
                          </span>
                        </td>
                        <td className="p-3 border border-stone-200 text-stone-600 italic">
                          {s.texto_simple || <span className="text-stone-300">{"<Vacío - Contenido Dinámico de Archivos>"}</span>}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedSheet === "archivos" && (
            <div>
              <div className="mb-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Requisito 3 Soportado:</strong> Secciones como Bibliografía, Diapositivas y Apuntes simplemente consultan esta hoja filtrando por <code>ID_Catedra</code> y <code>Tipo_Seccion</code>. El orden numérico define en qué secuencia aparecen.
                </span>
              </div>
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 uppercase">
                    <th className="p-3 border border-stone-200">ID_Catedra (FK)</th>
                    <th className="p-3 border border-stone-200">Tipo_Seccion</th>
                    <th className="p-3 border border-stone-200">Nombre_Archivo</th>
                    <th className="p-3 border border-stone-200">Link_Drive</th>
                    <th className="p-3 border border-stone-200">Orden</th>
                    <th className="p-3 border border-stone-200">Fecha_Subida</th>
                  </tr>
                </thead>
                <tbody>
                  {mockArchivos
                    .filter((a) => a.id_catedra === selectedCatedra)
                    .map((a, idx) => (
                      <tr key={idx} className="hover:bg-amber-50/40">
                        <td className="p-3 border border-stone-200 text-stone-500">{a.id_catedra}</td>
                        <td className="p-3 border border-stone-200 font-bold text-blue-800">{a.tipo_seccion}</td>
                        <td className="p-3 border border-stone-200">{a.nombre_archivo}</td>
                        <td className="p-3 border border-stone-200 text-amber-600 underline truncate max-w-xs">{a.link_drive}</td>
                        <td className="p-3 border border-stone-200 text-center font-bold">{a.orden}</td>
                        <td className="p-3 border border-stone-200 text-stone-400">{a.fecha_subida}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedSheet === "asistencia" && (
            <div>
              <div className="mb-4 text-xs text-stone-600 bg-stone-100 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-stone-500 shrink-0" />
                  <span>
                    <strong>Requisito 1 Soportado:</strong> Muestra el porcentaje consolidado del cuatrimestre por estudiante. Soporta históricos por año.
                  </span>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="font-semibold text-stone-700">Filtrado por: {selectedCatedra} (Año 2026)</span>
                  {isDemoMode.asistencia ? (
                    <span className="px-2 py-0.5 text-[9px] font-mono bg-amber-100 text-amber-800 rounded-sm font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      MOCK/DEMO
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[9px] font-mono bg-emerald-100 text-emerald-800 rounded-sm font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      EN VIVO (SHEETS)
                    </span>
                  )}
                </div>
              </div>

              {loadingAsistencia ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-stone-500">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                  <p className="text-xs font-mono">Conectando con la API de Google Sheets...</p>
                </div>
              ) : errorAsistencia ? (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 text-center space-y-3 my-4">
                  <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
                  <p className="text-sm font-semibold text-rose-950">No se pudieron cargar los datos de asistencia</p>
                  <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                    {errorAsistencia}. Asegúrate de que los IDs reales en <code className="bg-white px-1 py-0.5 rounded border">src/config/sheets.ts</code> sean correctos y que la planilla esté compartida con permisos de lectura.
                  </p>
                  <button
                    onClick={loadSheetsData}
                    className="mt-2 inline-flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer active:scale-95 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reintentar Conexión</span>
                  </button>
                </div>
              ) : asistencia.length === 0 ? (
                <div className="text-center py-12 text-stone-400 italic text-xs">
                  Sin datos de asistencia disponibles para este ciclo
                </div>
              ) : (
                <table className="w-full text-left border-collapse font-mono text-xs animate-fade-in">
                  <thead>
                    <tr className="bg-stone-100 text-stone-700 uppercase">
                      <th className="p-3 border border-stone-200">ID_Catedra (FK)</th>
                      <th className="p-3 border border-stone-200">Anio (Cohorte)</th>
                      <th className="p-3 border border-stone-200">Estudiante</th>
                      <th className="p-3 border border-stone-200">Porcentaje_Asistencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asistencia.map((a, idx) => (
                      <tr key={idx} className={`hover:bg-amber-50/40 ${a.anio !== 2026 ? "bg-stone-50 text-stone-400 font-light" : ""}`}>
                        <td className="p-3 border border-stone-200">{a.id_catedra}</td>
                        <td className="p-3 border border-stone-200">{a.anio}</td>
                        <td className="p-3 border border-stone-200 font-bold">{a.estudiante}</td>
                        <td className="p-3 border border-stone-200 font-bold text-stone-900">{a.porcentaje}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {selectedSheet === "notas_num" && (
            <div>
              {selectedCatedra === "TECNO_3" && (
                <div className="mb-4 text-xs text-rose-800 bg-rose-50 border border-rose-200 p-4 rounded-lg">
                  <strong>⚠️ Alerta de Esquema:</strong> Esta hoja <strong>NO pertenece a Tecno III</strong>. Tecno III utiliza un esquema descriptivo/cualitativo diferente (Hoja 6) porque evalúa por estado (Aprobado/Desaprobado + Proyecto Práctico). Por favor, cambiá el filtro superior a "Biología Molecular" para ver cómo se alimenta esta tabla.
                </div>
              )}
              <div className="mb-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>Requisito 5 & 2 (Bio Molecular / Tecno II) Soportado:</strong> Tabla estructurada con columnas para teoría/práctica independientes, recuperatorios y condición final calculada.
                  </span>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {isDemoMode.notas ? (
                    <span className="px-2 py-0.5 text-[9px] font-mono bg-amber-100 text-amber-800 rounded-sm font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      MOCK/DEMO
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[9px] font-mono bg-emerald-100 text-emerald-800 rounded-sm font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      EN VIVO (SHEETS)
                    </span>
                  )}
                </div>
              </div>

              {loadingNotas ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-stone-500">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                  <p className="text-xs font-mono">Conectando con la API de Google Sheets...</p>
                </div>
              ) : errorNotas ? (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 text-center space-y-3 my-4">
                  <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
                  <p className="text-sm font-semibold text-rose-950">No se pudieron cargar las calificaciones numéricas</p>
                  <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                    {errorNotas}. Asegúrate de que los IDs reales en <code className="bg-white px-1 py-0.5 rounded border">src/config/sheets.ts</code> sean correctos y que la planilla esté compartida con permisos de lectura.
                  </p>
                  <button
                    onClick={loadSheetsData}
                    className="mt-2 inline-flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer active:scale-95 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reintentar Conexión</span>
                  </button>
                </div>
              ) : notasNum.length === 0 ? (
                <div className="text-center py-12 text-stone-400 italic text-xs">
                  Sin datos de calificaciones disponibles para este ciclo
                </div>
              ) : (
                <table className="w-full text-left border-collapse font-mono text-[10px] md:text-xs animate-fade-in">
                  <thead>
                    <tr className="bg-stone-100 text-stone-700 uppercase">
                      <th className="p-2 border border-stone-200">Anio</th>
                      <th className="p-2 border border-stone-200">Estudiante</th>
                      <th className="p-2 border border-stone-200 bg-blue-50/50">P1 Teoría %</th>
                      <th className="p-2 border border-stone-200 bg-blue-50/50">P1 Práctica %</th>
                      <th className="p-2 border border-stone-200 bg-blue-50/50">P1 Result.</th>
                      <th className="p-2 border border-stone-200 bg-green-50/50">P2 Teoría %</th>
                      <th className="p-2 border border-stone-200 bg-green-50/50">P2 Práctica %</th>
                      <th className="p-2 border border-stone-200 bg-green-50/50">P2 Result.</th>
                      <th className="p-2 border border-stone-200 bg-amber-50/50">Recup. (1P/2P)</th>
                      <th className="p-2 border border-stone-200 bg-amber-50/50">Rec Teoría %</th>
                      <th className="p-2 border border-stone-200 bg-amber-50/50">Rec Práctica %</th>
                      <th className="p-2 border border-stone-200 bg-amber-50/50">Rec Result.</th>
                      <th className="p-2 border border-stone-200 bg-stone-200 font-bold">Condición Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notasNum
                      .filter(() => selectedCatedra !== "TECNO_3")
                      .map((n, idx) => (
                        <tr key={idx} className={`hover:bg-amber-50/40 ${n.anio !== 2026 ? "bg-stone-50 text-stone-400" : ""}`}>
                          <td className="p-2 border border-stone-200">{n.anio}</td>
                          <td className="p-2 border border-stone-200 font-bold">{n.estudiante}</td>
                          <td className="p-2 border border-stone-200 bg-blue-50/20">{n.p1_teoria}</td>
                          <td className="p-2 border border-stone-200 bg-blue-50/20">{n.p1_practica}</td>
                          <td className="p-2 border border-stone-200 bg-blue-50/20 font-semibold">{n.p1_resultado}</td>
                          <td className="p-2 border border-stone-200 bg-green-50/20">{n.p2_teoria}</td>
                          <td className="p-2 border border-stone-200 bg-green-50/20">{n.p2_practica}</td>
                          <td className="p-2 border border-stone-200 bg-green-50/20 font-semibold">{n.p2_resultado}</td>
                          <td className="p-2 border border-stone-200 bg-amber-50/20 font-bold text-center">{n.recupera}</td>
                          <td className="p-2 border border-stone-200 bg-amber-50/20">{n.rec_teoria}</td>
                          <td className="p-2 border border-stone-200 bg-amber-50/20">{n.rec_practica}</td>
                          <td className="p-2 border border-stone-200 bg-amber-50/20 font-semibold">{n.rec_resultado}</td>
                          <td className="p-2 border border-stone-200 bg-stone-100 font-bold text-stone-900">
                            <span className={`px-1.5 py-0.5 rounded-sm ${
                              n.condicion_final === "Promoción" 
                                ? "bg-emerald-100 text-emerald-800" 
                                : n.condicion_final === "Regular" 
                                  ? "bg-amber-100 text-amber-800" 
                                  : "bg-rose-150 text-rose-800"
                            }`}>
                              {n.condicion_final}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {selectedSheet === "notas_status" && (
            <div>
              {selectedCatedra === "BIO_MOL" && (
                <div className="mb-4 text-xs text-rose-800 bg-rose-50 border border-rose-200 p-4 rounded-lg">
                  <strong>⚠️ Alerta de Esquema:</strong> Esta hoja <strong>pertenece a Tecno III</strong>. Biología Molecular y Tecno II usan el esquema de notas numéricas por separado (Hoja 5) porque exigen notas de práctica independientes y un sistema numérico ponderado. Por favor, cambiá el filtro superior a "Tecno III" para ver cómo se alimenta esta tabla.
                </div>
              )}
              <div className="mb-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>Requisito 5 (Tecno III) Soportado:</strong> Esquema cualitativo/status. Elimina los porcentajes de práctica en favor de un estado general de "Práctica" (Aprobado/Pendiente).
                  </span>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {isDemoMode.notas ? (
                    <span className="px-2 py-0.5 text-[9px] font-mono bg-amber-100 text-amber-800 rounded-sm font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      MOCK/DEMO
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[9px] font-mono bg-emerald-100 text-emerald-800 rounded-sm font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      EN VIVO (SHEETS)
                    </span>
                  )}
                </div>
              </div>

              {loadingNotas ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-stone-500">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                  <p className="text-xs font-mono">Conectando con la API de Google Sheets...</p>
                </div>
              ) : errorNotas ? (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 text-center space-y-3 my-4">
                  <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
                  <p className="text-sm font-semibold text-rose-950">No se pudieron cargar las calificaciones de estado</p>
                  <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                    {errorNotas}. Asegúrate de que los IDs reales en <code className="bg-white px-1 py-0.5 rounded border">src/config/sheets.ts</code> sean correctos y que la planilla esté compartida con permisos de lectura.
                  </p>
                  <button
                    onClick={loadSheetsData}
                    className="mt-2 inline-flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer active:scale-95 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reintentar Conexión</span>
                  </button>
                </div>
              ) : notasStatus.length === 0 ? (
                <div className="text-center py-12 text-stone-400 italic text-xs">
                  Sin datos de calificaciones disponibles para este ciclo
                </div>
              ) : (
                <table className="w-full text-left border-collapse font-mono text-xs animate-fade-in">
                  <thead>
                    <tr className="bg-stone-100 text-stone-700 uppercase">
                      <th className="p-3 border border-stone-200">Anio</th>
                      <th className="p-3 border border-stone-200">Estudiante</th>
                      <th className="p-3 border border-stone-200 bg-blue-50/50">P1 Teoría %</th>
                      <th className="p-3 border border-stone-200 bg-blue-50/50">P1 Condición</th>
                      <th className="p-3 border border-stone-200 bg-green-50/50">P2 Teoría %</th>
                      <th className="p-3 border border-stone-200 bg-green-50/50">P2 Condición</th>
                      <th className="p-3 border border-stone-200 bg-amber-50/50">Recup. Teoría %</th>
                      <th className="p-3 border border-stone-200 bg-amber-50/50">Recup. Condición</th>
                      <th className="p-3 border border-stone-200 bg-purple-50/50">Práctica Global</th>
                      <th className="p-3 border border-stone-200 bg-stone-200 font-bold">Condición Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notasStatus
                      .filter((n) => selectedCatedra === "TECNO_3")
                      .map((n, idx) => (
                        <tr key={idx} className="hover:bg-amber-50/40 animate-fade-in">
                          <td className="p-3 border border-stone-200">{n.anio}</td>
                          <td className="p-3 border border-stone-200 font-bold">{n.estudiante}</td>
                          <td className="p-3 border border-stone-200 bg-blue-50/20">{n.p1_teoria}</td>
                          <td className="p-3 border border-stone-200 bg-blue-50/20 font-semibold">{n.p1_condicion}</td>
                          <td className="p-3 border border-stone-200 bg-green-50/20">{n.p2_teoria}</td>
                          <td className="p-3 border border-stone-200 bg-green-50/20 font-semibold">{n.p2_condicion}</td>
                          <td className="p-3 border border-stone-200 bg-amber-50/20">{n.rec_teoria}</td>
                          <td className="p-3 border border-stone-200 bg-amber-50/20 font-semibold">{n.rec_condicion}</td>
                          <td className="p-3 border border-stone-200 bg-purple-50/20 font-bold text-stone-800">{n.practica}</td>
                          <td className="p-3 border border-stone-200 bg-stone-100 font-bold text-stone-900">
                            <span className={`px-1.5 py-0.5 rounded-sm ${
                              n.condicion_final === "Promoción" 
                                ? "bg-emerald-100 text-emerald-800" 
                                : n.condicion_final === "Regular" 
                                  ? "bg-amber-100 text-amber-800" 
                                  : "bg-rose-100 text-rose-800"
                            }`}>
                              {n.condicion_final}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* LIVE PREVIEW OF HOW THIS RENDERS FOR STUDENTS */}
      <div className="bg-[#FAF9F6] border border-stone-200 rounded-xl p-6 shadow-xs animate-fade-in">
        <h4 className="font-bold text-stone-950 text-sm uppercase tracking-wider font-mono mb-4 text-stone-500 flex items-center gap-2">
          <Eye className="w-4 h-4 text-amber-600" />
          <span>Simulador del Portal Web (Vista Estudiante)</span>
        </h4>

        <div className="bg-white rounded-lg border border-stone-200 shadow-xs overflow-hidden">
          <div className="bg-stone-900 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight">Cátedra Activa:</span>
              <span className="bg-amber-600 px-2 py-0.5 text-xs rounded-sm font-semibold">
                {selectedCatedra === "BIO_MOL" ? "Biología Molecular" : "Tecno III"}
              </span>
            </div>
            <span className="text-xs text-stone-400 font-mono">Cohorte 2026 (1er Cuat.)</span>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* SECCION PROGRAMA / CONDICIONES */}
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs mb-2 uppercase font-mono">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Programa & Cursada</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed line-clamp-4">
                  {mockSecciones.find(s => s.id_catedra === selectedCatedra && s.seccion === "Programa")?.texto_simple}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-200 text-[10px] text-stone-400">
                Vía Hoja: <code className="bg-stone-100 px-1 py-0.5 text-amber-800">Secciones_Estado</code>
              </div>
            </div>

            {/* SECCION ARCHIVOS (DIAPOSITIVAS) */}
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs mb-2 uppercase font-mono">
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Últimas Diapositivas</span>
                </div>
                <ul className="space-y-2 text-xs">
                  {mockArchivos
                    .filter(a => a.id_catedra === selectedCatedra && a.tipo_seccion === "Diapositivas")
                    .map((a, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-stone-700 hover:text-stone-900">
                        <ExternalLink className="w-3 h-3 text-stone-400 shrink-0" />
                        <span className="truncate underline font-medium">{a.nombre_archivo}</span>
                      </li>
                    ))}
                  {mockArchivos.filter(a => a.id_catedra === selectedCatedra && a.tipo_seccion === "Diapositivas").length === 0 && (
                    <li className="text-stone-400 italic">No hay archivos cargados.</li>
                  )}
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-200 text-[10px] text-stone-400">
                Vía Hoja: <code className="bg-stone-100 px-1 py-0.5 text-amber-800">Archivos</code>
              </div>
            </div>

            {/* SECCION ASISTENCIA & NOTAS ALUMNO */}
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs mb-2 uppercase font-mono">
                  <Users className="w-3.5 h-3.5" />
                  <span>Rendimiento del Alumno</span>
                </div>
                <div className="space-y-3">
                  {loadingAsistencia || loadingNotas ? (
                    <div className="flex flex-col items-center justify-center py-4 gap-2 text-stone-500 text-xs">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                      <span>Cargando rendimiento...</span>
                    </div>
                  ) : (selectedCatedra === "TECNO_3" ? notasStatus : notasNum).length > 0 ? (
                    (() => {
                      const primerEstudiante = selectedCatedra === "TECNO_3" ? notasStatus[0] : notasNum[0];
                      const asistEstudiante = asistencia.find(a => a.estudiante.toLowerCase() === primerEstudiante?.estudiante.toLowerCase());
                      return (
                        <div className="bg-white p-3 rounded-md border border-stone-150 animate-fade-in space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-stone-500">Estudiante:</span>
                            <span className="text-stone-900 truncate max-w-[130px]" title={primerEstudiante?.estudiante}>
                              {primerEstudiante?.estudiante}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-stone-500">Asistencia Total:</span>
                            <span className="text-emerald-600 font-bold">{asistEstudiante?.porcentaje || "-"}</span>
                          </div>
                          <div className="flex justify-between text-xs mt-1 pt-1.5 border-t border-stone-100">
                            <span className="text-stone-500">Condición Final:</span>
                            <span className={`text-stone-900 font-bold px-1.5 py-0.5 rounded-sm text-[10px] ${
                              primerEstudiante?.condicion_final === "Promoción"
                                ? "bg-emerald-50 text-emerald-800"
                                : primerEstudiante?.condicion_final === "Regular"
                                  ? "bg-amber-50 text-amber-800"
                                  : "bg-rose-50 text-rose-800"
                            }`}>
                              {primerEstudiante?.condicion_final || "-"}
                            </span>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-xs text-stone-400 italic py-4 text-center">
                      Sin datos disponibles
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-200 text-[10px] text-stone-400">
                Vía Hoja: <code className="bg-stone-100 px-1 py-0.5 text-amber-800">Asistencia</code> & <code className="bg-stone-100 px-1 py-0.5 text-amber-800">Notas_*</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
