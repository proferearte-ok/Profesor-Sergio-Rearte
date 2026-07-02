/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  BookOpen, 
  FileText, 
  Download, 
  Calendar, 
  Award, 
  CheckCircle2, 
  Loader2, 
  AlertTriangle, 
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  FileSpreadsheet
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  mockCatedras, 
  mockSecciones, 
  mockArchivos, 
  mockAsistencia, 
  mockNotasNum, 
  mockNotasStatus 
} from "../../data/mockData";
import { SHEETS_CONFIG } from "../../config/sheets";
import { 
  getAsistenciaFromSheet, 
  getNotasNumFromSheet, 
  getNotasStatusFromSheet 
} from "../../services/googleSheets";
import { Asistencia, NotaNum, NotaStatus } from "../../types";
import StudentSearch from "./StudentSearch";

export default function PortalView() {
  // Solo mostramos las cátedras marcadas como activas
  const activeCatedras = mockCatedras.filter(c => c.activa);
  const [selectedCatedra, setSelectedCatedra] = useState<string>(
    activeCatedras.length > 0 ? activeCatedras[0].id : "BIO_MOL"
  );
  
  const [activeSection, setActiveSection] = useState<string>("Programa");

  // Dynamic state for Sheets data
  const [asistencia, setAsistencia] = useState<Asistencia[]>([]);
  const [notasNum, setNotasNum] = useState<NotaNum[]>([]);
  const [notasStatus, setNotasStatus] = useState<NotaStatus[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  // Alumno seleccionado por el buscador
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const currentCatedra = mockCatedras.find(c => c.id === selectedCatedra) || activeCatedras[0];
  const currentYear = currentCatedra?.anio_vigente || 2026;

  // Carga de datos de la cátedra seleccionada
  const loadCatedraData = async () => {
    setSelectedStudent(null);
    const config = SHEETS_CONFIG[selectedCatedra];
    if (!config) return;

    const isAsistenciaDemo = !config.asistencia.spreadsheetId || config.asistencia.spreadsheetId.startsWith("TU_ID_AQUI");
    const isNotasDemo = !config.notas.spreadsheetId || config.notas.spreadsheetId.startsWith("TU_ID_AQUI");

    if (isAsistenciaDemo || isNotasDemo) {
      // Carga Mock
      setAsistencia(mockAsistencia.filter(a => a.id_catedra === selectedCatedra));
      if (selectedCatedra === "TECNO_3") {
        setNotasStatus(mockNotasStatus.filter(n => n.id_catedra === selectedCatedra));
      } else {
        setNotasNum(mockNotasNum.filter(n => n.id_catedra === selectedCatedra));
      }
      setIsDemoMode(true);
      setLoading(false);
      setErrorMsg(null);
    } else {
      // Carga Real de Sheets
      setLoading(true);
      setErrorMsg(null);
      setIsDemoMode(false);
      try {
        const asistData = await getAsistenciaFromSheet(
          config.asistencia.spreadsheetId,
          config.asistencia.sheetName,
          selectedCatedra,
          currentYear
        );
        setAsistencia(asistData);

        if (selectedCatedra === "TECNO_3") {
          const statusData = await getNotasStatusFromSheet(
            config.notas.spreadsheetId,
            config.notas.sheetName,
            selectedCatedra,
            currentYear
          );
          setNotasStatus(statusData);
        } else {
          const numData = await getNotasNumFromSheet(
            config.notas.spreadsheetId,
            config.notas.sheetName,
            selectedCatedra,
            currentYear
          );
          setNotasNum(numData);
        }
      } catch (err: any) {
        console.error("Error al cargar Google Sheets:", err);
        setErrorMsg(
          err.message || "Error al conectar con las planillas de Google. Por favor intenta de nuevo."
        );
        // Fallback inmediato a demo para que el sitio siga siendo interactivo
        setAsistencia(mockAsistencia.filter(a => a.id_catedra === selectedCatedra));
        if (selectedCatedra === "TECNO_3") {
          setNotasStatus(mockNotasStatus.filter(n => n.id_catedra === selectedCatedra));
        } else {
          setNotasNum(mockNotasNum.filter(n => n.id_catedra === selectedCatedra));
        }
        setIsDemoMode(true);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadCatedraData();
  }, [selectedCatedra]);

  // Secciones disponibles para la cátedra seleccionada
  const seccionesCatedra = mockSecciones.filter(s => s.id_catedra === selectedCatedra);

  // Obtener lista única de alumnos para el buscador de la cátedra
  const getStudentList = (): string[] => {
    const names = new Set<string>();
    asistencia.forEach(a => names.add(a.estudiante));
    if (selectedCatedra === "TECNO_3") {
      notasStatus.forEach(n => names.add(n.estudiante));
    } else {
      notasNum.forEach(n => names.add(n.estudiante));
    }
    return Array.from(names).sort();
  };

  const studentsList = getStudentList();

  // Buscar información de un estudiante seleccionado
  const studentAttendance = asistencia.find(
    a => a.estudiante.toLowerCase() === selectedStudent?.toLowerCase()
  );
  
  const studentGradesNum = notasNum.find(
    n => n.estudiante.toLowerCase() === selectedStudent?.toLowerCase()
  );

  const studentGradesStatus = notasStatus.find(
    n => n.estudiante.toLowerCase() === selectedStudent?.toLowerCase()
  );

  // 8 Secciones del portal
  const menuSections = [
    { name: "Programa", icon: BookOpen },
    { name: "Condiciones de Cursada", icon: Info },
    { name: "Bibliografía", icon: FileText },
    { name: "Cronograma", icon: Calendar },
    { name: "Diapositivas", icon: Layers },
    { name: "Apuntes de Clase", icon: FileText },
    { name: "Asistencia", icon: CheckCircle2 },
    { name: "Notas", icon: Award },
  ];

  // Renderizador del cronograma
  const renderCronograma = () => {
    if (currentCatedra.tipo_cronograma === "TEXTO_SIMPLE") {
      return (
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs animate-fade-in">
          <h4 className="font-semibold text-stone-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider font-mono">
            <span>Cronograma de Cursada</span>
          </h4>
          <p className="text-stone-600 leading-relaxed text-sm">
            {currentCatedra.contenido_cronograma}
          </p>
        </div>
      );
    }

    if (currentCatedra.tipo_cronograma === "LISTA_FECHAS") {
      const fechasBio = [
        { sem: "Semana 1", desc: "Introducción a la Genética Molecular y Estructura del ADN (Teórico/Práctico)" },
        { sem: "Semana 3", desc: "Replicación del ADN y Enzimas Involucradas. Trabajos Prácticos de Laboratorio 1" },
        { sem: "Semana 6", desc: "Transcripción y Síntesis de ARN. Hito de Entrega del Informe de Laboratorio 1" },
        { sem: "Semana 9", desc: "Primer Parcial Teórico-Práctico Integrador (Aulas 102-105)" },
        { sem: "Semana 12", desc: "Traducción Proteica y Mutaciones Génicas. Trabajos Prácticos de Laboratorio 2" },
        { sem: "Semana 15", desc: "Segundo Parcial Teórico-Práctico e Integración Final de Calificaciones" },
      ];

      return (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs">
            <h4 className="font-semibold text-stone-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider font-mono">
              <span>Hitos y Fechas Clave del Cuatrimestre</span>
            </h4>
            <div className="relative border-l-2 border-amber-200 pl-6 ml-4 space-y-6">
              {fechasBio.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-xs"></div>
                  <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200/50">
                    {item.sem}
                  </span>
                  <p className="text-stone-700 mt-2 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (currentCatedra.tipo_cronograma === "CALENDAR_EMBEBIDO") {
      return (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
              <h4 className="font-semibold text-stone-900 flex items-center gap-2 text-sm uppercase tracking-wider font-mono">
                <span>Calendario de Google Integrado</span>
              </h4>
              <a
                href="https://calendar.google.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-amber-800 hover:text-amber-900 font-medium underline"
              >
                <span>Abrir en ventana independiente</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="aspect-video w-full rounded-lg border border-stone-200 overflow-hidden bg-stone-50 flex items-center justify-center relative min-h-[300px]">
              <iframe
                src="https://calendar.google.com/calendar/embed?src=es.ar%23holiday%40group.v.calendar.google.com&ctz=America%2FArgentina%2FBuenos_Aires"
                className="absolute inset-0 w-full h-full border-none"
                title="Calendario Cátedra"
              ></iframe>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // Renderizador de listas de archivos (Bibliografía, Diapositivas, Apuntes)
  const renderArchivosSection = (tipo: "Bibliografia" | "Diapositivas" | "Apuntes_Clase") => {
    // Filtramos y ordenamos los archivos
    const archivos = mockArchivos
      .filter(a => a.id_catedra === selectedCatedra && a.tipo_seccion === tipo)
      .sort((a, b) => a.orden - b.orden);

    // Verificar si la sección está inactiva en la configuración
    const seccionConfigName = tipo === "Bibliografia" ? "Bibliografía" : tipo === "Diapositivas" ? "Diapositivas" : "Apuntes de Clase";
    const seccionConfig = seccionesCatedra.find(s => s.seccion === seccionConfigName);

    if (seccionConfig?.estado === "Inactiva") {
      return (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-8 text-center max-w-lg mx-auto space-y-3 animate-fade-in">
          <Info className="w-8 h-8 text-stone-400 mx-auto" />
          <h5 className="font-bold text-stone-900 text-sm">Sección en Preparación</h5>
          <p className="text-xs text-stone-500 leading-relaxed">
            {seccionConfig.texto_simple || "Esta sección se encuentra temporalmente inactiva o en proceso de edición por el equipo docente de la cátedra."}
          </p>
        </div>
      );
    }

    if (archivos.length === 0) {
      return (
        <div className="bg-white border border-stone-200 rounded-xl p-8 text-center max-w-lg mx-auto space-y-3 animate-fade-in">
          <FileText className="w-8 h-8 text-stone-300 mx-auto animate-pulse" />
          <h5 className="font-bold text-stone-700 text-sm">Sin archivos disponibles</h5>
          <p className="text-xs text-stone-500 leading-relaxed">
            Esta sección todavía no tiene contenido cargado en la planilla. Los apuntes se irán subiendo a medida que avance el cuatrimestre.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
        {archivos.map((file, idx) => (
          <div
            key={idx}
            className="bg-white border border-stone-200 rounded-xl p-4 flex items-start justify-between gap-4 hover:border-amber-500 hover:shadow-xs transition-all duration-200"
          >
            <div className="space-y-1 truncate">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-stone-100 flex items-center justify-center text-[10px] font-mono font-bold text-stone-600">
                  {file.orden}
                </span>
                <h5 className="font-semibold text-stone-950 text-sm truncate" title={file.nombre_archivo}>
                  {file.nombre_archivo}
                </h5>
              </div>
              <p className="text-[10px] text-stone-400 font-mono">Publicado: {file.fecha_subida}</p>
            </div>
            <a
              href={file.link_drive}
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-stone-50 hover:bg-amber-100 text-stone-600 hover:text-amber-950 rounded-lg shrink-0 transition-colors cursor-pointer active:scale-95"
              title="Descargar desde Google Drive"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* CATEDRA SWITCHER AND SOURCE STATE */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
        <div>
          <span className="text-xs font-mono text-stone-400 uppercase tracking-widest">Portal Académico Estudiantil</span>
          <h3 className="text-lg font-bold text-stone-900 tracking-tight">Acceso Público de Lectura de Cátedras</h3>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Cátedras Activas */}
          <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-full md:w-auto">
            {activeCatedras.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCatedra(cat.id);
                  setActiveSection("Programa");
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all w-full md:w-auto ${
                  selectedCatedra === cat.id
                    ? "bg-white text-stone-950 shadow-sm font-bold"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>

          {/* Banner de origen de datos */}
          <div className="shrink-0 hidden sm:block">
            {loading ? (
              <span className="px-3 py-1 text-[10px] font-mono bg-stone-100 text-stone-500 rounded-full flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                <span>Conectando...</span>
              </span>
            ) : isDemoMode ? (
              <span className="px-3 py-1 text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200 rounded-full flex items-center gap-1.5 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Modo Demo</span>
              </span>
            ) : (
              <span className="px-3 py-1 text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full flex items-center gap-1.5 font-bold animate-fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Sheets en Vivo</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ERROR BANNER IF SHEETS CONNECTION FAILS AND SAYS DEMO FALLBACK */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-4 flex items-start gap-3 animate-fade-in text-xs max-w-4xl mx-auto">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Aviso de sincronización:</p>
            <p className="text-stone-600 leading-relaxed">
              No pudimos conectar con las planillas de Google en vivo ({errorMsg}). Para mantener tu experiencia activa, el portal cargó automáticamente la base de datos de simulación segura (modo offline).
            </p>
          </div>
        </div>
      )}

      {/* PORTAL CORE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SIDEBAR SECTIONS MENU */}
        <div className="lg:col-span-1 space-y-2">
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-1">
            <p className="px-3 py-1 text-[10px] font-mono text-stone-400 uppercase tracking-widest mb-2 font-bold">
              Menú de Secciones
            </p>
            {menuSections.map(section => {
              const Icon = section.icon;
              const isSectionActiveInConfig = seccionesCatedra.find(s => s.seccion === section.name)?.estado !== "Inactiva";
              
              return (
                <button
                  key={section.name}
                  onClick={() => setActiveSection(section.name)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                    activeSection === section.name
                      ? "bg-amber-50 text-amber-950 font-bold border-l-4 border-amber-600 pl-2.5"
                      : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${activeSection === section.name ? "text-amber-600" : "text-stone-400"}`} />
                    <span>{section.name}</span>
                  </div>
                  {!isSectionActiveInConfig && (
                    <span className="text-[9px] font-mono font-bold bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded">
                      Pronto
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* INFORMACIÓN DEL CICLO */}
          <div className="bg-stone-900 text-stone-300 rounded-2xl p-4 shadow-sm space-y-3 font-mono text-[10px] border border-stone-800">
            <p className="text-white font-bold tracking-wider uppercase border-b border-stone-800 pb-1 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>INFORMACIÓN DE CURSADA</span>
            </p>
            <div className="space-y-1.5 text-stone-300">
              <p><span className="text-stone-500">Materia:</span> {currentCatedra.nombre}</p>
              <p><span className="text-stone-500">Dictado:</span> {currentCatedra.cuatrimestre}</p>
              <p><span className="text-stone-500">Cohorte:</span> Ciclo Lectivo {currentYear}</p>
              <p><span className="text-stone-500">Carácter:</span> Público Sin Login</p>
            </div>
          </div>
        </div>

        {/* MAIN SECTION CONTENT */}
        <div className="lg:col-span-3 min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedCatedra}-${activeSection}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* SECTION HEADER CARD */}
              <div className="bg-stone-900 text-white rounded-2xl p-6 shadow-sm border border-stone-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold">
                      {currentCatedra.nombre}
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">•</span>
                    <span className="text-[10px] font-mono text-stone-400">Ciclo {currentYear}</span>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-white">{activeSection}</h2>
                </div>
              </div>

              {/* SECTION BODY CARDS */}
              {activeSection === "Programa" && (
                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4 animate-fade-in">
                  <p className="text-stone-600 leading-relaxed text-sm">
                    {seccionesCatedra.find(s => s.seccion === "Programa")?.texto_simple || 
                      "El programa oficial de la asignatura se encuentra actualmente en edición o actualización por los coordinadores académicos."}
                  </p>
                </div>
              )}

              {activeSection === "Condiciones de Cursada" && (
                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4 animate-fade-in">
                  <p className="text-stone-600 leading-relaxed text-sm">
                    {seccionesCatedra.find(s => s.seccion === "Condiciones de Cursada")?.texto_simple || 
                      "Las normativas de regularidad, régimen de promoción directa y aprobación del proyecto final se encuentran publicadas en la cartelera física del departamento académico."}
                  </p>
                </div>
              )}

              {activeSection === "Bibliografía" && renderArchivosSection("Bibliografia")}
              {activeSection === "Cronograma" && renderCronograma()}
              {activeSection === "Diapositivas" && renderArchivosSection("Diapositivas")}
              {activeSection === "Apuntes de Clase" && renderArchivosSection("Apuntes_Clase")}

              {/* BUSCADOR DE ASISTENCIA */}
              {activeSection === "Asistencia" && (
                <div className="space-y-6">
                  <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="max-w-md mx-auto text-center space-y-2 mb-2">
                      <h4 className="font-bold text-stone-900 text-sm">Porcentaje de Asistencia por Estudiante</h4>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        De acuerdo con las reglamentaciones de la cátedra, debes cumplir con el porcentaje mínimo requerido de asistencia a clases prácticas para conservar la regularidad o acceder a la promoción.
                      </p>
                    </div>

                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-2 text-stone-500 text-xs">
                        <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                        <span>Cargando padrón estudiantil...</span>
                      </div>
                    ) : (
                      <StudentSearch
                        studentNames={studentsList}
                        placeholder="Escribe tu apellido o nombre para consultar..."
                        onSelect={setSelectedStudent}
                        selectedStudent={selectedStudent}
                        cohortYear={currentYear}
                      />
                    )}
                  </div>

                  {/* RESULTADO DE ASISTENCIA */}
                  {selectedStudent && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs max-w-lg mx-auto"
                    >
                      <div className="bg-stone-900 p-4 border-b border-stone-800 text-white flex justify-between items-center">
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-mono text-amber-400 font-bold uppercase">Estado Consolidado</p>
                          <h5 className="font-bold text-sm">{selectedStudent}</h5>
                        </div>
                        <span className="text-xs font-mono text-stone-400">Ciclo {currentYear}</span>
                      </div>
                      <div className="p-6 text-center space-y-4">
                        <div className="inline-flex flex-col items-center justify-center bg-stone-50 border border-stone-150 rounded-2xl px-6 py-4">
                          <p className="text-[10px] font-mono text-stone-400 uppercase font-bold tracking-wider mb-1">Porcentaje de Asistencia</p>
                          <span className="text-4xl font-extrabold text-stone-900 font-mono tracking-tight">
                            {studentAttendance?.porcentaje || "0%"}
                          </span>
                        </div>

                        {studentAttendance ? (
                          (() => {
                            const pct = parseInt(studentAttendance.porcentaje.replace("%", ""), 10) || 0;
                            const req = selectedCatedra === "BIO_MOL" ? 80 : 75; // Biología molecular pide 80%, otros 75%
                            const cumple = pct >= req;

                            return (
                              <div className={`p-4 rounded-xl border text-xs leading-relaxed max-w-sm mx-auto ${
                                cumple 
                                  ? "bg-emerald-50/50 border-emerald-200 text-emerald-900" 
                                  : "bg-rose-50/50 border-rose-200 text-rose-950"
                              }`}>
                                {cumple ? (
                                  <p>
                                    <strong>¡Cumple Requisito!</strong> Tu asistencia del <strong>{studentAttendance.porcentaje}</strong> supera el mínimo del {req}% exigido por la asignatura.
                                  </p>
                                ) : (
                                  <p>
                                    <strong>Requisito Insuficiente:</strong> Tu asistencia actual es del <strong>{studentAttendance.porcentaje}</strong>, estando por debajo del {req}% requerido. Consulta con los docentes auxiliares.
                                  </p>
                                )}
                              </div>
                            );
                          })()
                        ) : (
                          <p className="text-xs text-stone-400 italic">No se registraron planillas de asistencia para este alumno en este ciclo.</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* BUSCADOR DE NOTAS */}
              {activeSection === "Notas" && (
                <div className="space-y-6">
                  <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="max-w-md mx-auto text-center space-y-2 mb-2">
                      <h4 className="font-bold text-stone-900 text-sm">Calificaciones e Historial de Exámenes</h4>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        Accede a las notas de tus evaluaciones parciales teóricas y prácticas, notas de recuperatorio y la condición final calculada según el régimen de la cátedra.
                      </p>
                    </div>

                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-2 text-stone-500 text-xs">
                        <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                        <span>Cargando padrón estudiantil...</span>
                      </div>
                    ) : (
                      <StudentSearch
                        studentNames={studentsList}
                        placeholder="Escribe tu apellido o nombre para consultar..."
                        onSelect={setSelectedStudent}
                        selectedStudent={selectedStudent}
                        cohortYear={currentYear}
                      />
                    )}
                  </div>

                  {/* RESULTADO DE NOTAS */}
                  {selectedStudent && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs max-w-2xl mx-auto"
                    >
                      <div className="bg-stone-900 p-4 border-b border-stone-800 text-white flex justify-between items-center">
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-mono text-amber-400 font-bold uppercase">Boletín Académico Individual</p>
                          <h5 className="font-bold text-sm">{selectedStudent}</h5>
                        </div>
                        <span className="text-xs font-mono text-stone-400">Ciclo {currentYear}</span>
                      </div>

                      <div className="p-5 space-y-6">
                        {/* CASO: BIOLOGÍA MOLECULAR O TECNO II (ESQUEMA NUMÉRICO) */}
                        {selectedCatedra !== "TECNO_3" ? (
                          studentGradesNum ? (
                            <div className="space-y-6 animate-fade-in">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-3.5 bg-stone-50 border border-stone-150 rounded-xl space-y-1">
                                  <p className="text-[9px] font-mono text-stone-400 uppercase font-bold">1er Parcial</p>
                                  <div className="flex justify-between items-baseline">
                                    <span className="text-xs text-stone-600">Teoría: {studentGradesNum.p1_teoria}</span>
                                    <span className="text-xs text-stone-600">Práctica: {studentGradesNum.p1_practica}</span>
                                  </div>
                                  <p className="text-xs font-semibold text-stone-800 pt-1 border-t border-stone-100 mt-1">
                                    Resultado: <span className="text-amber-800 font-bold">{studentGradesNum.p1_resultado}</span>
                                  </p>
                                </div>

                                <div className="p-3.5 bg-stone-50 border border-stone-150 rounded-xl space-y-1">
                                  <p className="text-[9px] font-mono text-stone-400 uppercase font-bold">2do Parcial</p>
                                  <div className="flex justify-between items-baseline">
                                    <span className="text-xs text-stone-600">Teoría: {studentGradesNum.p2_teoria}</span>
                                    <span className="text-xs text-stone-600">Práctica: {studentGradesNum.p2_practica}</span>
                                  </div>
                                  <p className="text-xs font-semibold text-stone-800 pt-1 border-t border-stone-100 mt-1">
                                    Resultado: <span className="text-amber-800 font-bold">{studentGradesNum.p2_resultado}</span>
                                  </p>
                                </div>

                                <div className="p-3.5 bg-amber-50/40 border border-amber-200/50 rounded-xl space-y-1">
                                  <p className="text-[9px] font-mono text-amber-800 uppercase font-bold">Recuperatorio ({studentGradesNum.recupera})</p>
                                  <div className="flex justify-between items-baseline">
                                    <span className="text-xs text-stone-600">Teoría: {studentGradesNum.rec_teoria}</span>
                                    <span className="text-xs text-stone-600">Práctica: {studentGradesNum.rec_practica}</span>
                                  </div>
                                  <p className="text-xs font-semibold text-amber-900 pt-1 border-t border-amber-100 mt-1">
                                    Resultado: <span className="text-amber-800 font-bold">{studentGradesNum.rec_resultado}</span>
                                  </p>
                                </div>
                              </div>

                              <div className="bg-stone-50 p-4 rounded-xl border border-stone-150 flex flex-col sm:flex-row justify-between items-center gap-3">
                                <div className="text-center sm:text-left">
                                  <p className="text-[10px] font-mono text-stone-400 uppercase font-bold mb-0.5">Condición de Regularidad</p>
                                  <h4 className="text-xs text-stone-600">Calculada en base a notas y recuperatorios del ciclo</h4>
                                </div>
                                <span className={`px-4 py-2 rounded-lg text-xs font-extrabold uppercase font-mono tracking-wider ${
                                  studentGradesNum.condicion_final === "Promoción" 
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                                    : studentGradesNum.condicion_final === "Regular" 
                                      ? "bg-amber-100 text-amber-800 border border-amber-200" 
                                      : "bg-rose-100 text-rose-800 border border-rose-200"
                                }`}>
                                  {studentGradesNum.condicion_final}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-stone-400 italic text-center py-4">No se registraron notas para este estudiante en este ciclo.</p>
                          )
                        ) : (
                          /* CASO: TECNO III (ESQUEMA CUALITATIVO) */
                          studentGradesStatus ? (
                            <div className="space-y-6 animate-fade-in">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-3.5 bg-stone-50 border border-stone-150 rounded-xl space-y-1">
                                  <p className="text-[9px] font-mono text-stone-400 uppercase font-bold">1er Parcial Teoría</p>
                                  <div className="flex justify-between items-baseline">
                                    <span className="text-stone-500 text-xs">Calificación:</span>
                                    <span className="font-semibold text-stone-800 text-xs">{studentGradesStatus.p1_teoria}</span>
                                  </div>
                                  <p className="text-xs font-semibold text-stone-800 pt-1 border-t border-stone-100 mt-1">
                                    Estado: <span className="text-amber-800 font-bold">{studentGradesStatus.p1_condicion}</span>
                                  </p>
                                </div>

                                <div className="p-3.5 bg-stone-50 border border-stone-150 rounded-xl space-y-1">
                                  <p className="text-[9px] font-mono text-stone-400 uppercase font-bold">2do Parcial Teoría</p>
                                  <div className="flex justify-between items-baseline">
                                    <span className="text-stone-500 text-xs">Calificación:</span>
                                    <span className="font-semibold text-stone-800 text-xs">{studentGradesStatus.p2_teoria}</span>
                                  </div>
                                  <p className="text-xs font-semibold text-stone-800 pt-1 border-t border-stone-100 mt-1">
                                    Estado: <span className="text-amber-800 font-bold">{studentGradesStatus.p2_condicion}</span>
                                  </p>
                                </div>

                                <div className="p-3.5 bg-amber-50/40 border border-amber-200/50 rounded-xl space-y-1">
                                  <p className="text-[9px] font-mono text-amber-800 uppercase font-bold">Recuperatorios</p>
                                  <div className="flex justify-between items-baseline">
                                    <span className="text-stone-500 text-xs">Calificación:</span>
                                    <span className="font-semibold text-stone-800 text-xs">{studentGradesStatus.rec_teoria}</span>
                                  </div>
                                  <p className="text-xs font-semibold text-amber-900 pt-1 border-t border-amber-100 mt-1">
                                    Estado: <span className="text-amber-800 font-bold">{studentGradesStatus.rec_condicion}</span>
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-stone-50 border border-stone-150 rounded-xl flex justify-between items-center">
                                  <div>
                                    <p className="text-[9px] font-mono text-stone-400 uppercase font-bold mb-0.5">Rendimiento Práctico</p>
                                    <h5 className="font-semibold text-stone-900 text-xs">Proyecto Troncal Global</h5>
                                  </div>
                                  <span className={`px-2.5 py-1 text-xs font-bold rounded ${
                                    studentGradesStatus.practica === "Aprobado" 
                                      ? "bg-emerald-50 text-emerald-800 border border-emerald-100" 
                                      : "bg-amber-50 text-amber-800 border border-amber-100"
                                  }`}>
                                    {studentGradesStatus.practica}
                                  </span>
                                </div>

                                <div className="p-4 bg-stone-50 border border-stone-150 rounded-xl flex justify-between items-center">
                                  <div>
                                    <p className="text-[9px] font-mono text-stone-400 uppercase font-bold mb-0.5">Condición Cursada</p>
                                    <h5 className="font-semibold text-stone-900 text-xs">Resultado final del cuatrimestre</h5>
                                  </div>
                                  <span className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase font-mono tracking-wider ${
                                    studentGradesStatus.condicion_final === "Promoción" 
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                                      : studentGradesStatus.condicion_final === "Regular" 
                                        ? "bg-amber-100 text-amber-800 border border-amber-200" 
                                        : "bg-rose-100 text-rose-800 border border-rose-200"
                                  }`}>
                                    {studentGradesStatus.condicion_final}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-stone-400 italic text-center py-4">No se registraron notas para este estudiante en este ciclo.</p>
                          )
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
