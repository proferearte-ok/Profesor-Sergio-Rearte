/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  User,
  GraduationCap,
  X,
  Check,
  AlertTriangle,
  BookOpen,
  RefreshCw,
  Award,
  Calendar,
  Layers,
  FileSpreadsheet,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { HistorialAlumno, MateriaHistorial } from "../../types";
import {
  getHistorialAlumnos,
  buscarAlumno,
  cleanLegajo,
  mockHistorialAlumnosDemo,
} from "../../services/actasAnalisis";
import { isValidGoogleSheetId } from "../../services/googleSheets";

export default function BuscadorAlumnos() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [alumnos, setAlumnos] = useState<HistorialAlumno[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<HistorialAlumno | null>(null);
  const [query, setQuery] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDemoData, setIsDemoData] = useState<boolean>(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const sheetId = import.meta.env.VITE_SHEET_ID_ACTAS_ANALISIS;
  const isSheetConfigured = isValidGoogleSheetId(sheetId);

  // Carga inicial de datos académicos
  const loadData = async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      if (!isSheetConfigured) {
        setIsDemoData(true);
        setAlumnos(mockHistorialAlumnosDemo);
        setLastSync(new Date());
      } else {
        setIsDemoData(false);
        const data = await getHistorialAlumnos(sheetId, forceRefresh);
        setAlumnos(data);
        setLastSync(new Date());
      }
    } catch (err: any) {
      console.error("Error al cargar Actas y Regularidades:", err);
      setError(err?.message || "No se pudo conectar con la planilla de Google Sheets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(false);
  }, []);

  // Cerrar sugerencias al hacer clic fuera del componente
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sugerencias de autocompletado calculadas dinámicamente (máx. 10)
  const suggestions = useMemo(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];
    const results = buscarAlumno(trimmed, alumnos);
    return results.slice(0, 10);
  }, [query, alumnos]);

  const handleSelectStudent = (student: HistorialAlumno) => {
    setSelectedStudent(student);
    setQuery("");
    setIsOpen(false);
  };

  const handleClearSelection = () => {
    setSelectedStudent(null);
    setQuery("");
    setIsOpen(false);
  };

  // Helper de badges para condición de cursada
  const getBadgeCondicionCursada = (condicionRaw: string) => {
    const norm = (condicionRaw || "").toLowerCase();
    if (norm.includes("promo")) {
      return "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold";
    }
    if (norm.includes("reg")) {
      return "bg-sky-50 text-sky-800 border-sky-300 font-bold";
    }
    if (norm.includes("lib") || norm.includes("desap")) {
      return "bg-rose-50 text-rose-800 border-rose-300 font-bold";
    }
    return "bg-stone-100 text-stone-700 border-stone-200 font-medium";
  };

  // Helper de badges para resultado de examen
  const getBadgeResultadoExamen = (resultadoRaw: string, notaRaw: string) => {
    const normRes = (resultadoRaw || "").toLowerCase();
    const notaNum = parseFloat(notaRaw.replace(",", "."));

    if (normRes.includes("aprob") || normRes.includes("prom") || (!isNaN(notaNum) && notaNum >= 4)) {
      return "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold";
    }
    if (normRes.includes("reprob") || normRes.includes("desap") || (!isNaN(notaNum) && notaNum < 4)) {
      return "bg-rose-100 text-rose-900 border-rose-300 font-bold";
    }
    if (normRes.includes("aus")) {
      return "bg-amber-100 text-amber-900 border-amber-300 font-bold";
    }
    return "bg-stone-100 text-stone-800 border-stone-300 font-bold";
  };

  // Estadísticas del alumno seleccionado
  const statsSeleccionado = useMemo(() => {
    if (!selectedStudent) return null;
    const materias = Object.keys(selectedStudent.porMateria);
    let totalCursadas = 0;
    let totalExamenes = 0;
    let examenesAprobados = 0;

    materias.forEach((m) => {
      const h = selectedStudent.porMateria[m];
      totalCursadas += h.cursadas.length;
      totalExamenes += h.examenes.length;
      examenesAprobados += h.examenes.filter((e) => {
        const res = (e.resultado || "").toLowerCase();
        const notaNum = parseFloat(e.nota.replace(",", "."));
        return res.includes("aprob") || (!isNaN(notaNum) && notaNum >= 4);
      }).length;
    });

    return {
      totalMaterias: materias.length,
      totalCursadas,
      totalExamenes,
      examenesAprobados,
    };
  }, [selectedStudent]);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* HEADER DEL BUSCADOR DOCENTE */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#1A1F35] text-[#FCE19C] flex items-center justify-center shrink-0 shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-stone-900 font-sans tracking-tight">
                  Buscador de Historial Académico
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-950 border border-amber-300">
                  Panel Docente
                </span>
                {isDemoData && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Datos Demo
                  </span>
                )}
              </div>
              <p className="text-sm text-stone-600 mt-1">
                Consulta unificada de cursadas anuales (Regularidad) y exámenes finales rendidos (Datos Completos).
              </p>
            </div>
          </div>

          {/* ACCIONES DE ESTADO Y RECARGA */}
          <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
            {lastSync && (
              <span className="text-xs font-mono text-stone-500 hidden sm:flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                Sincronizado: {lastSync.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}

            <button
              id="btn-recargar-actas"
              onClick={() => loadData(true)}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-mono font-bold border border-stone-200 transition-all cursor-pointer disabled:opacity-50 active:scale-95 shadow-2xs"
              title="Recargar datos de la planilla Google Sheets"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-800" : ""}`} />
              <span>{loading ? "Cargando..." : "Recargar Planilla"}</span>
            </button>
          </div>
        </div>

        {/* ALERTA INFORMATIVA SI NO ESTÁ CONFIGURADA LA VARIABLE DE ENTORNO */}
        {!isSheetConfigured && (
          <div className="mt-5 p-4 bg-amber-50/80 border border-amber-300/80 rounded-xl text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4.5 h-4.5 text-amber-800 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-amber-950 font-sans">
                  Variable <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-bold">VITE_SHEET_ID_ACTAS_ANALISIS</code> no configurada
                </p>
                <p className="text-stone-600 mt-0.5">
                  Estás visualizando datos de prueba simulados. Para conectar la planilla real con las pestañas <strong>"Datos Completos"</strong> y <strong>"Regularidad"</strong>, agregá el ID en el archivo <code className="font-mono">.env</code>.
                </p>
              </div>
            </div>
            <a
              href="https://docs.google.com/spreadsheets"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-800 text-white font-mono font-bold text-xs hover:bg-amber-900 transition-colors shrink-0 shadow-2xs"
            >
              <span>Abrir Google Sheets</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* MENSAJE DE ERROR SI HUBO FALLO DE RED / PARSEO */}
        {error && (
          <div className="mt-5 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-3 animate-fade-in">
            <AlertTriangle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">No se pudo obtener la información de Actas y Regularidades</p>
              <p className="text-rose-700 mt-0.5">{error}</p>
              <p className="text-stone-500 mt-1 font-mono">
                Verifica que la planilla tenga acceso público para lectura y que contenga las pestañas "Datos Completos" y "Regularidad".
              </p>
            </div>
          </div>
        )}

        {/* BARRA DE BÚSQUEDA CON AUTOCOMPLETADO */}
        <div className="mt-6 max-w-2xl" ref={containerRef}>
          <label className="block text-xs font-mono text-stone-600 uppercase tracking-wider mb-2 font-bold">
            BUSCAR ESTUDIANTE (POR NOMBRE O LEGAJO)
          </label>

          {selectedStudent ? (
            /* ESTADO CUANDO YA HAY UN ALUMNO SELECCIONADO */
            <div className="flex items-center justify-between bg-stone-50/80 border-2 border-amber-800/30 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#1A1F35] text-[#FCE19C] flex items-center justify-center font-bold text-base font-mono shadow-xs border border-amber-400/20">
                  {selectedStudent.apellidoYNombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-500 font-mono uppercase tracking-widest font-bold">
                      Estudiante Seleccionado
                    </span>
                    {selectedStudent.legajo ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-stone-200 text-stone-800">
                        Legajo: {selectedStudent.legajo}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-700" />
                        Sin Legajo en Planilla
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-stone-900 font-sans mt-0.5">
                    {selectedStudent.apellidoYNombre}
                  </h4>
                </div>
              </div>

              <button
                id="btn-cambiar-estudiante"
                onClick={handleClearSelection}
                className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-stone-200 text-stone-700 rounded-xl transition-colors cursor-pointer border border-stone-300 font-mono text-xs font-bold shadow-2xs active:scale-95"
                title="Buscar otro estudiante"
              >
                <X className="w-4 h-4 text-stone-600" />
                <span>Cambiar</span>
              </button>
            </div>
          ) : (
            /* INPUT DE BÚSQUEDA Y SUGERENCIAS */
            <div className="relative">
              <div className="relative">
                <input
                  id="input-buscar-alumno"
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setIsOpen(true);
                  }}
                  onFocus={() => setIsOpen(true)}
                  placeholder="Escribí un apellido, nombre o número de legajo (ej. 1001 o Perez)..."
                  className="w-full pl-12 pr-11 py-3.5 bg-white border border-stone-300 text-stone-900 placeholder-stone-400 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all shadow-2xs font-sans min-h-[50px]"
                />
                <div className="absolute left-4 top-4 text-stone-400">
                  <Search className="w-5 h-5 text-stone-400" />
                </div>
                {query && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setIsOpen(false);
                    }}
                    className="absolute right-3.5 top-3.5 p-1 text-stone-400 hover:text-stone-700 rounded-full cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* MENÚ FLOTANTE DE SUGERENCIAS */}
              {isOpen && query.trim().length >= 2 && (
                <div className="absolute z-30 w-full mt-2 bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden animate-fade-in max-h-[360px] overflow-y-auto">
                  {suggestions.length > 0 ? (
                    <div className="py-1">
                      <div className="px-4 py-2.5 bg-stone-100/90 text-xs font-mono text-stone-600 border-b border-stone-200 uppercase tracking-widest font-bold flex justify-between items-center">
                        <span>SUGERENCIAS ({suggestions.length})</span>
                        <span className="text-[10px] lowercase text-stone-500 font-sans font-normal">
                          presiona para ver historial completo
                        </span>
                      </div>
                      {suggestions.map((student, idx) => {
                        const cantMaterias = Object.keys(student.porMateria).length;
                        return (
                          <button
                            key={idx}
                            id={`suggestion-alumno-${idx}`}
                            onClick={() => handleSelectStudent(student)}
                            className="w-full text-left px-4 py-3 hover:bg-amber-50/80 text-stone-900 text-sm flex items-center justify-between border-b border-stone-100 last:border-b-0 transition-colors cursor-pointer min-h-[48px]"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#1A1F35] text-[#FCE19C] flex items-center justify-center font-bold text-xs font-mono">
                                {student.apellidoYNombre.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-stone-900 font-sans">
                                  {student.apellidoYNombre}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {student.legajo ? (
                                    <span className="text-[11px] font-mono text-stone-500 font-medium">
                                      Legajo: <strong>{student.legajo}</strong>
                                    </span>
                                  ) : (
                                    <span className="text-[11px] font-mono text-amber-700 bg-amber-50 px-1.5 rounded">
                                      Sin legajo
                                    </span>
                                  )}
                                  <span className="text-stone-300">•</span>
                                  <span className="text-[11px] font-mono text-stone-500">
                                    {cantMaterias} {cantMaterias === 1 ? "materia" : "materias"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Check className="w-4 h-4 text-amber-800 shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-4 py-5 text-center text-stone-500 text-xs font-mono italic">
                      No se encontraron estudiantes que coincidan con "{query}"
                    </div>
                  )}
                </div>
              )}

              {isOpen && query.trim().length === 1 && (
                <div className="absolute z-30 w-full mt-2 bg-white border border-stone-200 rounded-xl p-3 text-center text-stone-500 text-xs font-mono shadow-lg">
                  Escribe al menos 2 caracteres o dígitos para buscar...
                </div>
              )}
            </div>
          )}

          {/* TOTAL INDEXADOS */}
          <div className="mt-2.5 flex items-center gap-2 text-xs font-mono text-stone-500">
            <span>Base de datos:</span>
            <span className="font-bold text-stone-700">{alumnos.length} alumnos indexados</span>
            <span>•</span>
            <span>Pestañas: Datos Completos (Exámenes) + Regularidad (Cursadas)</span>
          </div>
        </div>
      </div>

      {/* ESTADO DE CARGA GLOBAL */}
      {loading && (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center shadow-2xs space-y-3">
          <div className="inline-block p-4 rounded-full bg-amber-50 border border-amber-200 text-amber-900">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
          <h4 className="text-lg font-bold text-stone-900 font-sans">
            Cargando datos académicos...
          </h4>
          <p className="text-sm text-stone-600 max-w-md mx-auto">
            Descargando y cruzando registros de cursadas y exámenes desde Google Sheets. Por favor, aguarda un momento.
          </p>
        </div>
      )}

      {/* DETALLE DEL ALUMNO SELECCIONADO */}
      {!loading && selectedStudent && (
        <div className="space-y-6 animate-fade-in">
          {/* BANNER DE RESUMEN DEL ALUMNO */}
          <div className="bg-gradient-to-r from-[#1A1F35] to-[#252C48] text-white rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 text-[#FCE19C] flex items-center justify-center font-black text-2xl font-mono shadow-inner">
                  {selectedStudent.apellidoYNombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-mono text-amber-300 font-bold uppercase tracking-wider">
                      HISTORIAL ACADÉMICO UNIFICADO
                    </span>
                    {selectedStudent.legajo ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/20 text-white">
                        Legajo: {selectedStudent.legajo}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-400 text-amber-950 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Sin Legajo Registrado
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black font-sans tracking-tight">
                    {selectedStudent.apellidoYNombre}
                  </h3>
                </div>
              </div>

              {/* STATS DEL ALUMNO */}
              {statsSeleccionado && (
                <div className="grid grid-cols-3 gap-3 border-t md:border-t-0 md:border-l border-white/15 pt-4 md:pt-0 md:pl-6">
                  <div className="text-center md:text-left">
                    <p className="text-[11px] font-mono text-white/70 uppercase">Materias</p>
                    <p className="text-xl font-black font-mono text-[#FCE19C]">
                      {statsSeleccionado.totalMaterias}
                    </p>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-[11px] font-mono text-white/70 uppercase">Cursadas</p>
                    <p className="text-xl font-black font-mono text-white">
                      {statsSeleccionado.totalCursadas}
                    </p>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-[11px] font-mono text-white/70 uppercase">Exámenes</p>
                    <p className="text-xl font-black font-mono text-white">
                      {statsSeleccionado.totalExamenes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* LISTADO POR MATERIA */}
          {Object.keys(selectedStudent.porMateria).length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center text-stone-500 shadow-2xs">
              <FileText className="w-8 h-8 mx-auto text-stone-400 mb-2" />
              <p className="font-bold text-stone-700">No hay registros de materias para este estudiante.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(selectedStudent.porMateria).map(([materia, data]: [string, MateriaHistorial], idx) => {
                const tieneCursadas = data.cursadas && data.cursadas.length > 0;
                const tieneExamenes = data.examenes && data.examenes.length > 0;

                return (
                  <div
                    key={idx}
                    id={`card-materia-${idx}`}
                    className="bg-white border border-stone-200/90 rounded-2xl p-6 md:p-8 shadow-2xs space-y-6"
                  >
                    {/* ENCABEZADO DE LA MATERIA */}
                    <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-lg md:text-xl font-bold text-stone-900 font-sans">
                            {materia}
                          </h4>
                          <p className="text-xs font-mono text-stone-500">
                            {tieneCursadas ? `${data.cursadas.length} cursada(s)` : "Sin cursada"} •{" "}
                            {tieneExamenes ? `${data.examenes.length} examen(es) rendido(s)` : "Sin exámenes"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* DOS BLOQUES SEPARADOS: CURSADAS Y EXÁMENES RENDIDOS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* BLOQUE 1: CURSADAS (REGULARIDAD) */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-stone-500" />
                            <h5 className="font-bold text-sm text-stone-800 uppercase font-mono tracking-wider">
                              Cursadas
                            </h5>
                          </div>
                          <span className="text-xs font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                            Pestaña Regularidad
                          </span>
                        </div>

                        {tieneCursadas ? (
                          <div className="border border-stone-200 rounded-xl overflow-hidden shadow-2xs bg-stone-50/50">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-stone-100/90 border-b border-stone-200 font-mono text-stone-600 uppercase tracking-wider text-[11px]">
                                <tr>
                                  <th className="px-3.5 py-2.5 font-bold">Año Cursada</th>
                                  <th className="px-3.5 py-2.5 font-bold">Condición</th>
                                  <th className="px-3.5 py-2.5 font-bold text-right">Origen</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-stone-200 bg-white">
                                {data.cursadas.map((cur, cIdx) => (
                                  <tr key={cIdx} className="hover:bg-stone-50/80 transition-colors">
                                    <td className="px-3.5 py-3 font-mono font-bold text-stone-900 text-sm">
                                      {cur.anio || "—"}
                                    </td>
                                    <td className="px-3.5 py-3">
                                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                                        <span
                                          className={`inline-block px-2.5 py-1 rounded-md text-xs font-mono border ${getBadgeCondicionCursada(
                                            cur.condicion
                                          )}`}
                                        >
                                          {cur.condicion || "Sin dato"}
                                        </span>

                                        {/* INDICADOR VISUAL REQUERIDO: CRUZADO POR NOMBRE */}
                                        {cur.matchedBy === "nombre" && (
                                          <span
                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs"
                                            title="El legajo estaba vacío en la planilla de regularidad; se vinculó por coincidencia de Apellido y Nombre."
                                          >
                                            <AlertTriangle className="w-3 h-3 text-amber-700" />
                                            <span>⚠ cruzado por nombre</span>
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-3.5 py-3 text-right text-[11px] font-mono text-stone-500">
                                      {cur.catedraOrigen || cur.carrera || "—"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-5 bg-stone-50 border border-dashed border-stone-200 rounded-xl text-center text-xs font-mono text-stone-500 space-y-1">
                            <p className="font-semibold">Sin cursada registrada para esta materia</p>
                            <p className="text-[11px] text-stone-400">
                              No se encontraron filas en la pestaña "Regularidad".
                            </p>
                          </div>
                        )}
                      </div>

                      {/* BLOQUE 2: EXÁMENES RENDIDOS (DATOS COMPLETOS) */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-stone-500" />
                            <h5 className="font-bold text-sm text-stone-800 uppercase font-mono tracking-wider">
                              Exámenes Rendidos
                            </h5>
                          </div>
                          <span className="text-xs font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                            Pestaña Datos Completos
                          </span>
                        </div>

                        {tieneExamenes ? (
                          <div className="border border-stone-200 rounded-xl overflow-hidden shadow-2xs bg-stone-50/50">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-stone-100/90 border-b border-stone-200 font-mono text-stone-600 uppercase tracking-wider text-[11px]">
                                <tr>
                                  <th className="px-3.5 py-2.5 font-bold">Fecha</th>
                                  <th className="px-3.5 py-2.5 font-bold text-center">Nota</th>
                                  <th className="px-3.5 py-2.5 font-bold">Resultado</th>
                                  <th className="px-3.5 py-2.5 font-bold text-right">Acta / Tipo</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-stone-200 bg-white">
                                {data.examenes.map((ex, eIdx) => (
                                  <tr key={eIdx} className="hover:bg-stone-50/80 transition-colors">
                                    <td className="px-3.5 py-3 font-mono text-stone-800">
                                      <div className="font-bold text-stone-900">{ex.fecha || "—"}</div>
                                      {ex.turno && (
                                        <div className="text-[10px] text-stone-500 font-mono">
                                          Turno: {ex.turno}
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-3.5 py-3 text-center">
                                      <span className="font-mono font-black text-base text-stone-900">
                                        {ex.nota || "—"}
                                      </span>
                                    </td>
                                    <td className="px-3.5 py-3">
                                      <span
                                        className={`inline-block px-2.5 py-1 rounded-md text-xs font-mono border ${getBadgeResultadoExamen(
                                          ex.resultado,
                                          ex.nota
                                        )}`}
                                      >
                                        {ex.resultado || "Sin resultado"}
                                      </span>
                                    </td>
                                    <td className="px-3.5 py-3 text-right text-[11px] font-mono text-stone-500">
                                      <div>{ex.nroActa ? `Acta ${ex.nroActa}` : "—"}</div>
                                      {ex.tipoActa && (
                                        <div className="text-[10px] text-stone-400 uppercase">
                                          {ex.tipoActa}
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-5 bg-stone-50 border border-dashed border-stone-200 rounded-xl text-center text-xs font-mono text-stone-500 space-y-1">
                            <p className="font-semibold">Sin exámenes registrados para esta materia</p>
                            <p className="text-[11px] text-stone-400">
                              No figuran finales rendidos en la pestaña "Datos Completos".
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ESTADO VACÍO INICIAL (SIN SELECCIÓN) */}
      {!loading && !selectedStudent && (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center shadow-2xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center mx-auto shadow-2xs">
            <Search className="w-8 h-8 text-amber-800" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="text-lg font-bold text-stone-900 font-sans">
              Selecciona o busca a un alumno
            </h4>
            <p className="text-sm text-stone-600">
              Escribe en el campo superior el apellido, nombre o número de legajo para visualizar su historial académico cruzado en tiempo real.
            </p>
          </div>

          {/* ATAJOS RÁPIDOS DE EJEMPLO SI HAY ALUMNOS */}
          {alumnos.length > 0 && (
            <div className="pt-4 border-t border-stone-100 max-w-xl mx-auto">
              <p className="text-xs font-mono text-stone-500 mb-2.5 uppercase tracking-wider font-bold">
                Alumnos sugeridos para probar:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {alumnos.slice(0, 4).map((al, idx) => (
                  <button
                    key={idx}
                    id={`quick-select-alumno-${idx}`}
                    onClick={() => handleSelectStudent(al)}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-amber-100 text-stone-800 text-xs font-mono rounded-lg border border-stone-200 transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <User className="w-3.5 h-3.5 text-stone-500" />
                    <span>{al.apellidoYNombre}</span>
                    {al.legajo && <span className="text-stone-500">({al.legajo})</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
