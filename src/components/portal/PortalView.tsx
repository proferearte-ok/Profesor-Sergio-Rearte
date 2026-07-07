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
  Info,
  Layers,
  ChevronRight,
  TrendingUp,
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
import { SHEETS_CONFIG, CRONOGRAMAS_SHEET_ID } from "../../config/sheets";
import { 
  getAsistenciaFromSheet, 
  getNotasNumFromSheet, 
  getNotasStatusFromSheet,
  getCronogramaClasesFromSheet
} from "../../services/googleSheets";
import { Asistencia, NotaNum, NotaStatus, ClaseCronograma } from "../../types";
import StudentSearch from "./StudentSearch";

export default function PortalView() {
  const [catedras, setCatedras] = useState<any[]>(mockCatedras);
  const [secciones, setSecciones] = useState<any[]>(mockSecciones);
  const [archivosList, setArchivosList] = useState<any[]>(mockArchivos);

  const activeCatedras = catedras.filter(c => c.activa);
  
  const [selectedCatedra, setSelectedCatedra] = useState<string>(
    activeCatedras.length > 0 ? activeCatedras[0].id : "BIO_MOL"
  );
  
  // Navigation tabs for Fintech UI: 'inicio' | 'archivos' | 'cronograma' | 'rendimiento'
  const [activeTab, setActiveTab] = useState<"inicio" | "archivos" | "cronograma" | "rendimiento">("inicio");
  
  // Sub-section filter inside 'archivos'
  const [activeFileSubSection, setActiveFileSubSection] = useState<"Bibliografia" | "Diapositivas" | "Apuntes_Clase" | "Programa" | "Condiciones_Cronograma">("Bibliografia");

  // Dynamic state for Sheets data
  const [asistencia, setAsistencia] = useState<Asistencia[]>([]);
  const [notasNum, setNotasNum] = useState<NotaNum[]>([]);
  const [notasStatus, setNotasStatus] = useState<NotaStatus[]>([]);

  // States for dynamic Google Drive listing
  const [carpetasDrive, setCarpetasDrive] = useState<any[]>([]);
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [driveLoading, setDriveLoading] = useState<boolean>(false);
  const [driveError, setDriveError] = useState<string | null>(null);

  // States for LISTA_CLASES cronograma
  const [clasesCronograma, setClasesCronograma] = useState<ClaseCronograma[]>([]);
  const [cronogramaLoading, setCronogramaLoading] = useState<boolean>(false);
  const [cronogramaError, setCronogramaError] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [configLoading, setConfigLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  // Alumno seleccionado por el buscador
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const currentCatedra = catedras.find(c => c.id === selectedCatedra) || activeCatedras[0] || mockCatedras[0];
  const currentYear = currentCatedra?.anio_vigente || 2026;

  // Carga de configuración dinámica desde la planilla del Panel Docente si está definida
  useEffect(() => {
    const loadPanelConfig = async () => {
      const panelConfigId = import.meta.env.VITE_SHEET_ID_PANEL_CONFIG;
      
      const isValidGoogleSheetId = (id: string | undefined): boolean => {
        if (!id) return false;
        const trimmed = id.trim();
        if (trimmed.startsWith("TU_ID_AQUI") || trimmed === "") return false;
        // Si coincide con la contraseña del docente, es un error de configuración
        const pwd = import.meta.env.VITE_DOCENTE_PASSWORD || "catedras2026";
        if (trimmed === pwd.trim()) return false;
        if (trimmed.length < 25) return false;
        return /^[a-zA-Z0-9-_]+$/.test(trimmed);
      };

      if (!isValidGoogleSheetId(panelConfigId)) {
        console.info("ℹ️ [CONFIG] El ID 'VITE_SHEET_ID_PANEL_CONFIG' no está configurado o es inválido (ej: coincide con la contraseña). Usando datos locales por defecto.");
        return;
      }

      try {
        setConfigLoading(true);
        const { 
          getCatedrasFromSheet, 
          getSeccionesFromSheet, 
          getArchivosFromSheet,
          getCarpetasDriveFromSheet 
        } = await import("../../services/googleSheets");
        
        console.info("⚡ [CONFIG] Conectando con planilla unificada del Panel Docente...");
        const fetchedCatedras = await getCatedrasFromSheet(panelConfigId!);
        const fetchedSecciones = await getSeccionesFromSheet(panelConfigId!);
        const fetchedArchivos = await getArchivosFromSheet(panelConfigId!);
        const fetchedCarpetasDrive = await getCarpetasDriveFromSheet(panelConfigId!);

        // Enriquecer cátedras con la información de cronograma de la hoja Secciones
        const enrichedCatedras = fetchedCatedras.map(cat => {
          const cronoSec = fetchedSecciones.find(s => s.id_catedra === cat.id && s.seccion === "Cronograma");
          return {
            ...cat,
            tipo_cronograma: cronoSec?.tipo_cronograma || "TEXTO_SIMPLE",
            contenido_cronograma: cronoSec?.contenido_cronograma || ""
          };
        });

        setCatedras(enrichedCatedras);
        setSecciones(fetchedSecciones);
        setArchivosList(fetchedArchivos);
        setCarpetasDrive(fetchedCarpetasDrive);

        // Si la cátedra seleccionada ya no existe o no está activa, cambiar a la primera activa
        const activeCats = enrichedCatedras.filter(c => c.activa);
        if (activeCats.length > 0 && !activeCats.some(c => c.id === selectedCatedra)) {
          setSelectedCatedra(activeCats[0].id);
        }
        console.info("✅ [CONFIG] Configuración del panel docente cargada en vivo con éxito.");
      } catch (err: any) {
        console.warn("⚠️ [CONFIG] No se pudo cargar configuración en vivo desde el panel docente:", err);
        // Error no bloquea el sistema: se mantienen los mocks por defecto
      } finally {
        setConfigLoading(false);
      }
    };

    loadPanelConfig();
  }, []);

  // Carga de datos de la cátedra seleccionada
  const loadCatedraData = async () => {
    setSelectedStudent(null);
    const config = SHEETS_CONFIG[selectedCatedra];
    if (!config) return;

    const isAsistenciaDemo = !config.asistencia.spreadsheetId || config.asistencia.spreadsheetId.startsWith("TU_ID_AQUI");
    const isNotasDemo = !config.notas.spreadsheetId || config.notas.spreadsheetId.startsWith("TU_ID_AQUI");

    if (isAsistenciaDemo || isNotasDemo) {
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

  // Load LISTA_CLASES cronograma when active and selectedCatedra changes
  useEffect(() => {
    let active = true;
    const fetchCronograma = async () => {
      if (currentCatedra?.tipo_cronograma !== "LISTA_CLASES") {
        setClasesCronograma([]);
        return;
      }

      setCronogramaLoading(true);
      setCronogramaError(null);
      try {
        const spreadsheetId = CRONOGRAMAS_SHEET_ID;
        const sheetName = currentCatedra.id; // e.g., "BIO_MOL", "TECNO_2", "TECNO_3"
        
        if (!spreadsheetId || spreadsheetId.startsWith("TU_ID_AQUI")) {
          // If no spreadsheet is set, let's load a mock list of classes for demonstration
          console.warn("⚠️ VITE_SHEET_ID_CRONOGRAMAS no está configurado. Usando mock data para LISTA_CLASES.");
          const mockClases: ClaseCronograma[] = [
            {
              fecha: new Date(2026, 2, 10),
              fechaTexto: "10 de Marzo",
              horario: "8:30 a 12:00",
              aula: "Aula 102",
              tema: "Clase 1: Introducción a la materia y presentación del programa de estudios.",
              tipo: "Normal"
            },
            {
              fecha: new Date(2026, 2, 17),
              fechaTexto: "17 de Marzo",
              horario: "8:30 a 12:00",
              aula: "Aula 102",
              tema: "Clase 2: Estructura del ADN y replicación celular.",
              tipo: "Normal"
            },
            {
              fecha: new Date(2026, 2, 24),
              fechaTexto: "24 de Marzo",
              horario: "",
              aula: "",
              tema: "",
              tipo: "Feriado"
            },
            {
              fecha: new Date(2026, 2, 31),
              fechaTexto: "31 de Marzo",
              horario: "8:30 a 12:00",
              aula: "Aula 102",
              tema: "Clase 3: Transcripción del ARN y síntesis proteica.",
              tipo: "Normal"
            },
            {
              fecha: new Date(2026, 3, 4),
              fechaTexto: "4 de Abril",
              horario: "14:00 a 16:00",
              aula: "Laboratorio B",
              tema: "Clase Extra: Consulta y resolución de dudas pre-examen.",
              tipo: "Extra"
            }
          ];
          if (active) {
            setClasesCronograma(mockClases);
          }
        } else {
          const data = await getCronogramaClasesFromSheet(spreadsheetId, sheetName);
          if (active) {
            setClasesCronograma(data);
          }
        }
      } catch (err: any) {
        console.error("Error al cargar el cronograma de clases:", err);
        if (active) {
          setCronogramaError("No se pudo cargar el cronograma de clases desde Google Sheets.");
        }
      } finally {
        if (active) {
          setCronogramaLoading(false);
        }
      }
    };

    fetchCronograma();

    return () => {
      active = false;
    };
  }, [selectedCatedra, currentCatedra?.tipo_cronograma]);

  // Hook to fetch Google Drive folder files dynamically when folder_id_drive is configured
  useEffect(() => {
    if (
      activeFileSubSection !== "Bibliografia" &&
      activeFileSubSection !== "Diapositivas" &&
      activeFileSubSection !== "Apuntes_Clase"
    ) {
      setDriveFiles([]);
      setDriveError(null);
      return;
    }

    const matchedFolder = carpetasDrive.find(
      c => c.id_catedra === selectedCatedra && c.tipo_seccion === activeFileSubSection
    );

    if (!matchedFolder || !matchedFolder.folder_id_drive || matchedFolder.folder_id_drive.trim() === "") {
      setDriveFiles([]);
      setDriveError(null);
      return;
    }

    let isMounted = true;
    const fetchDriveFiles = async () => {
      try {
        setDriveLoading(true);
        setDriveError(null);
        
        const { listDriveFolderFiles } = await import("../../services/googleDrive");
        const files = await listDriveFolderFiles(matchedFolder.folder_id_drive);
        
        if (isMounted) {
          setDriveFiles(files);
        }
      } catch (err: any) {
        console.error("Error cargando archivos de Drive:", err);
        if (isMounted) {
          setDriveError(err.message || "Error al obtener archivos de Google Drive.");
        }
      } finally {
        if (isMounted) {
          setDriveLoading(false);
        }
      }
    };

    fetchDriveFiles();

    return () => {
      isMounted = false;
    };
  }, [selectedCatedra, activeFileSubSection, carpetasDrive]);

  const seccionesCatedra = secciones.filter(s => s.id_catedra === selectedCatedra);

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

  const studentAttendance = asistencia.find(
    a => a.estudiante.toLowerCase() === selectedStudent?.toLowerCase()
  );
  
  const studentGradesNum = notasNum.find(
    n => n.estudiante.toLowerCase() === selectedStudent?.toLowerCase()
  );

  const studentGradesStatus = notasStatus.find(
    n => n.estudiante.toLowerCase() === selectedStudent?.toLowerCase()
  );

  // Helper to map id to beautiful tickers
  const getTickerCode = (id: string) => {
    if (id === "BIO_MOL") return "BIO-MOL";
    if (id === "TECNO_2") return "TECNO-II";
    if (id === "TECNO_3") return "TECNO-III";
    return id.toUpperCase().replace("_", "-");
  };

  // 4 main navigation tabs
  const navigationItems = [
    { id: "inicio", label: "Inicio", icon: BookOpen },
    { id: "archivos", label: "Archivos", icon: FileText },
    { id: "cronograma", label: "Cronograma", icon: Calendar },
    { id: "rendimiento", label: "Rendimiento", icon: Award },
  ] as const;

  // Render text-based, timeline list or embedded calendar
  const renderCronograma = () => {
    if (currentCatedra.tipo_cronograma === "TEXTO_SIMPLE") {
      return (
        <div className="bg-[#0F1420] border border-[#1E2531] rounded-2xl p-6 shadow-lg animate-fade-in space-y-4">
          <h4 className="font-bold text-[#EDEFF3] flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-[#5B6577]">
            <span>CRONOGRAMA DE CURSADA</span>
          </h4>
          <p className="text-[#EDEFF3]/90 leading-relaxed text-sm font-sans">
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
          <div className="bg-[#0F1420] border border-[#1E2531] rounded-2xl p-6 shadow-lg">
            <h4 className="font-bold text-[#EDEFF3] mb-6 flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-[#5B6577]">
              <span>HITOS Y FECHAS CLAVE</span>
            </h4>
            <div className="relative border-l-2 border-[#1E2531] pl-6 ml-4 space-y-8">
              {fechasBio.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#16C784] border-4 border-[#0F1420] shadow-sm animate-pulse"></div>
                  <span className="font-mono text-[10px] font-bold text-[#16C784] bg-[#16C784]/10 px-2.5 py-1 rounded border border-[#16C784]/20 uppercase tracking-wider">
                    {item.sem}
                  </span>
                  <p className="text-[#EDEFF3]/90 mt-3 text-sm leading-relaxed font-sans">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (currentCatedra.tipo_cronograma === "CALENDAR_EMBEBIDO") {
      const calendarUrl = currentCatedra.contenido_cronograma || "";
      const isGoogleCalendarUrl = calendarUrl.toLowerCase().includes("calendar.google.com");

      return (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-[#0F1420] border border-[#1E2531] rounded-2xl p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
              <h4 className="font-bold text-[#EDEFF3] flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-[#5B6577]">
                <span>CALENDARIO DE GOOGLE INTEGRADO</span>
              </h4>
              {isGoogleCalendarUrl && (
                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[10px] text-[#16C784] hover:text-[#16C784]/80 font-mono uppercase tracking-wider underline"
                >
                  <span>Abrir Ventana</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            <div className="aspect-video w-full rounded-xl border border-[#1E2531] overflow-hidden bg-[#131826] flex items-center justify-center relative min-h-[300px]">
              {isGoogleCalendarUrl ? (
                <iframe
                  src={calendarUrl}
                  className="absolute inset-0 w-full h-full border-none filter invert contrast-125 opacity-90"
                  title="Calendario Cátedra"
                ></iframe>
              ) : (
                <div className="text-center p-6 space-y-2">
                  <Calendar className="w-8 h-8 text-[#5B6577] mx-auto opacity-40" />
                  <p className="text-xs text-[#5B6577] italic font-sans">
                    El cronograma en calendario todavía no fue configurado para esta cátedra.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (currentCatedra.tipo_cronograma === "LISTA_CLASES") {
      if (cronogramaLoading) {
        return (
          <div className="bg-[#0F1420] border border-[#1E2531] rounded-2xl p-12 text-center shadow-lg animate-fade-in flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#16C784] animate-spin" />
            <p className="text-xs text-[#5B6577] font-mono uppercase tracking-wider">Cargando cronograma de clases...</p>
          </div>
        );
      }

      if (cronogramaError) {
        return (
          <div className="bg-[#0F1420] border border-red-900/30 rounded-2xl p-8 text-center shadow-lg animate-fade-in space-y-3">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-sm text-red-400 font-sans">{cronogramaError}</p>
          </div>
        );
      }

      if (!clasesCronograma || clasesCronograma.length === 0) {
        return (
          <div className="bg-[#0F1420] border border-[#1E2531] rounded-2xl p-12 text-center shadow-lg animate-fade-in space-y-2">
            <Calendar className="w-8 h-8 text-[#5B6577] mx-auto opacity-40" />
            <p className="text-xs text-[#5B6577] font-sans italic">
              Cronograma todavía no cargado para esta cátedra.
            </p>
          </div>
        );
      }

      return (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-[#0F1420] border border-[#1E2531] rounded-2xl p-6 shadow-lg">
            <h4 className="font-bold text-[#EDEFF3] mb-6 flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-[#5B6577]">
              <span>CRONOGRAMA DETALLADO DE CLASES</span>
            </h4>
            
            <div className="relative border-l border-[#1E2531] pl-6 ml-4 space-y-8">
              {clasesCronograma.map((clase, idx) => {
                const isFeriado = clase.tipo === "Feriado";
                const isExtra = clase.tipo === "Extra";

                return (
                  <div key={idx} className={`relative group ${isFeriado ? "opacity-45" : ""}`}>
                    {/* Circle marker on line */}
                    <div className={`absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[#0F1420] shadow-sm 
                      ${isFeriado 
                        ? "bg-[#5B6577]" 
                        : isExtra 
                          ? "bg-amber-500 animate-pulse" 
                          : "bg-[#16C784]"}`}
                    ></div>

                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-mono text-xs font-bold text-[#EDEFF3]">
                        {clase.fechaTexto}
                      </span>
                      
                      {!isFeriado && clase.horario && (
                        <span className="font-mono text-[10px] text-[#5B6577] bg-[#1E2531]/40 px-2 py-0.5 rounded border border-[#1E2531]">
                          {clase.horario}
                        </span>
                      )}

                      {!isFeriado && clase.aula && (
                        <span className="font-mono text-[10px] text-[#16C784] bg-[#16C784]/10 px-2 py-0.5 rounded border border-[#16C784]/20">
                          {clase.aula}
                        </span>
                      )}

                      {isExtra && (
                        <span className="font-mono text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 uppercase tracking-wider">
                          CLASE EXTRA
                        </span>
                      )}

                      {isFeriado && (
                        <span className="font-mono text-[9px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded border border-red-400/20 uppercase tracking-wider">
                          Feriado / Sin Clase
                        </span>
                      )}
                    </div>

                    <p className="text-[#EDEFF3]/90 text-sm leading-relaxed font-sans max-w-3xl">
                      {isFeriado ? (
                        <span className="italic text-[#5B6577]">Sin clase (feriado)</span>
                      ) : (
                        clase.tema
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // Render a clean list of files with download action on the right
  const renderArchivosSection = (tipo: "Bibliografia" | "Diapositivas" | "Apuntes_Clase" | "Programa" | "Condiciones_Cronograma") => {
    const seccionConfigName = 
      tipo === "Bibliografia" ? "Bibliografía" : 
      tipo === "Diapositivas" ? "Diapositivas" : 
      tipo === "Apuntes_Clase" ? "Apuntes de Clase" :
      tipo === "Programa" ? "Programa" : "Condiciones de Cursada";
    const seccionConfig = seccionesCatedra.find(s => s.seccion === seccionConfigName);

    if (seccionConfig?.estado === "Inactiva") {
      return (
        <div className="bg-[#0F1420] border border-[#1E2531] rounded-2xl p-8 text-center max-w-lg mx-auto space-y-4 animate-fade-in shadow-xl">
          <Info className="w-10 h-10 text-[#5B6577] mx-auto" />
          <div>
            <h5 className="font-bold text-[#EDEFF3] text-sm uppercase tracking-wider">Sección en Preparación</h5>
            <p className="text-xs text-[#5B6577] leading-relaxed mt-2 font-sans">
              {seccionConfig.texto_simple || "Esta sección se encuentra temporalmente inactiva o en proceso de edición por el equipo docente de la cátedra."}
            </p>
          </div>
        </div>
      );
    }

    // Verificar si es sección dinámica de Google Drive
    const isDynamicSection = tipo === "Bibliografia" || tipo === "Diapositivas" || tipo === "Apuntes_Clase";
    const matchedFolder = isDynamicSection 
      ? carpetasDrive.find(c => c.id_catedra === selectedCatedra && c.tipo_seccion === tipo)
      : null;
    const hasDriveFolder = !!(matchedFolder?.folder_id_drive && matchedFolder.folder_id_drive.trim() !== "");

    if (isDynamicSection && hasDriveFolder) {
      if (driveLoading) {
        return (
          <div className="bg-[#0F1420] border border-[#1E2531] rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4 animate-fade-in shadow-xl">
            <Loader2 className="w-8 h-8 text-[#16C784] mx-auto animate-spin" />
            <p className="text-xs text-[#5B6577] font-mono uppercase tracking-wider">Cargando archivos desde Google Drive...</p>
          </div>
        );
      }

      if (driveError) {
        return (
          <div className="bg-[#E24B4A]/10 border border-[#E24B4A]/25 rounded-2xl p-6 text-center max-w-lg mx-auto space-y-4 animate-fade-in">
            <AlertTriangle className="w-8 h-8 text-[#E24B4A] mx-auto" />
            <div>
              <h5 className="font-bold text-[#E24B4A] text-xs uppercase tracking-wider font-mono">Error de Sincronización</h5>
              <p className="text-xs text-[#5B6577] mt-2 font-sans leading-relaxed">
                {driveError}
              </p>
            </div>
          </div>
        );
      }

      if (driveFiles.length === 0) {
        return (
          <div className="bg-[#0F1420] border border-[#1E2531] rounded-2xl p-8 text-center max-w-lg mx-auto space-y-4 animate-fade-in shadow-xl">
            <FileText className="w-10 h-10 text-[#5B6577] mx-auto animate-pulse" />
            <div>
              <h5 className="font-bold text-[#EDEFF3] text-sm uppercase tracking-wider">Carpeta vacía</h5>
              <p className="text-xs text-[#5B6577] leading-relaxed mt-2 font-sans">
                No se encontraron archivos en la carpeta de Google Drive configurada para esta sección.
              </p>
            </div>
          </div>
        );
      }

      return (
        <div className="bg-[#0F1420] border border-[#1E2531] rounded-2xl overflow-hidden shadow-lg animate-fade-in">
          <div className="px-4 py-3 bg-[#131826]/60 border-b border-[#1E2531] flex justify-between items-center text-[10px] font-mono text-[#5B6577] uppercase tracking-wider font-bold">
            <span>Archivo / Publicación (En Vivo)</span>
            <span>Acción</span>
          </div>
          <div className="divide-y divide-[#1E2531]/60">
            {driveFiles.map((file, idx) => (
              <div
                key={file.id || idx}
                className="p-4 flex items-center justify-between gap-4 hover:bg-[#131826] transition-colors duration-200 min-h-[56px]"
              >
                <div className="flex items-center gap-3.5 truncate max-w-[80%]">
                  <div className="w-9 h-9 rounded-lg bg-[#131826] border border-[#1E2531] flex items-center justify-center shrink-0 text-xs font-mono font-bold text-[#16C784]">
                    {(idx + 1).toString().padStart(2, "0")}
                  </div>
                  <div className="space-y-0.5 truncate">
                    <h5 className="font-semibold text-[#EDEFF3] text-sm truncate font-sans" title={file.nombre_archivo}>
                      {file.nombre_archivo}
                    </h5>
                    <p className="text-[10px] text-[#5B6577] font-mono uppercase tracking-wider">
                      Publicado: <span className="font-mono">{file.fecha_subida}</span>
                    </p>
                  </div>
                </div>
                <a
                  href={file.link_drive}
                  target="_blank"
                  rel="noreferrer"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-[#131826] hover:bg-[#1E2531] text-[#EDEFF3] hover:text-[#16C784] border border-[#1E2531] rounded-xl transition-all duration-200 active:scale-95"
                  title="Descargar desde Google Drive"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Fallback: listado manual desde la pestaña Archivos de la planilla
    const archivos = archivosList
      .filter(a => a.id_catedra === selectedCatedra && a.tipo_seccion === tipo)
      .sort((a, b) => a.orden - b.orden);

    if (archivos.length === 0) {
      return (
        <div className="bg-[#0F1420] border border-[#1E2531] rounded-2xl p-8 text-center max-w-lg mx-auto space-y-4 animate-fade-in shadow-xl">
          <FileText className="w-10 h-10 text-[#5B6577] mx-auto animate-pulse" />
          <div>
            <h5 className="font-bold text-[#EDEFF3] text-sm uppercase tracking-wider">Sin archivos disponibles</h5>
            <p className="text-xs text-[#5B6577] leading-relaxed mt-2 font-sans">
              Esta sección todavía no tiene contenido cargado en la planilla. Los apuntes se irán subiendo a medida que avance el cuatrimestre.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-[#0F1420] border border-[#1E2531] rounded-2xl overflow-hidden shadow-lg animate-fade-in">
        <div className="px-4 py-3 bg-[#131826]/60 border-b border-[#1E2531] flex justify-between items-center text-[10px] font-mono text-[#5B6577] uppercase tracking-wider font-bold">
          <span>Archivo / Publicación</span>
          <span>Acción</span>
        </div>
        <div className="divide-y divide-[#1E2531]/60">
          {archivos.map((file, idx) => (
            <div
              key={idx}
              className="p-4 flex items-center justify-between gap-4 hover:bg-[#131826] transition-colors duration-200 min-h-[56px]"
            >
              <div className="flex items-center gap-3.5 truncate max-w-[80%]">
                <div className="w-9 h-9 rounded-lg bg-[#131826] border border-[#1E2531] flex items-center justify-center shrink-0 text-xs font-mono font-bold text-[#16C784]">
                  {file.orden.toString().padStart(2, "0")}
                </div>
                <div className="space-y-0.5 truncate">
                  <h5 className="font-semibold text-[#EDEFF3] text-sm truncate font-sans" title={file.nombre_archivo}>
                    {file.nombre_archivo}
                  </h5>
                  <p className="text-[10px] text-[#5B6577] font-mono uppercase tracking-wider">
                    Publicado: <span className="font-mono">{file.fecha_subida}</span>
                  </p>
                </div>
              </div>
              <a
                href={file.link_drive}
                target="_blank"
                rel="noreferrer"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-[#131826] hover:bg-[#1E2531] text-[#EDEFF3] hover:text-[#16C784] border border-[#1E2531] rounded-xl transition-all duration-200 active:scale-95"
                title="Descargar desde Google Drive"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renders a list of files inline within a section card
  const renderFileListOnly = (tipo: "Bibliografia" | "Diapositivas" | "Apuntes_Clase" | "Programa" | "Condiciones_Cronograma") => {
    const archivos = archivosList
      .filter(a => a.id_catedra === selectedCatedra && a.tipo_seccion === tipo)
      .sort((a, b) => a.orden - b.orden);

    if (archivos.length === 0) return null;

    return (
      <div className="mt-4 bg-[#131826]/40 border border-[#1E2531] rounded-xl overflow-hidden animate-fade-in">
        <div className="px-3.5 py-2 bg-[#131826]/80 border-b border-[#1E2531] flex justify-between items-center text-[9px] font-mono text-[#5B6577] uppercase tracking-wider font-bold">
          <span>Archivos Adjuntos ({archivos.length})</span>
          <span>Descargar</span>
        </div>
        <div className="divide-y divide-[#1E2531]/40">
          {archivos.map((file, idx) => (
            <div
              key={idx}
              className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#131826]/60 transition-colors duration-150"
            >
              <div className="flex items-center gap-3 truncate max-w-[80%]">
                <FileText className="w-4 h-4 text-[#16C784] shrink-0" />
                <div className="space-y-0.5 truncate">
                  <h5 className="font-semibold text-[#EDEFF3] text-xs truncate font-sans" title={file.nombre_archivo}>
                    {file.nombre_archivo}
                  </h5>
                  <p className="text-[9px] text-[#5B6577] font-mono uppercase">
                    Publicado: <span>{file.fecha_subida}</span>
                  </p>
                </div>
              </div>
              <a
                href={file.link_drive}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-[#0F1420] hover:bg-[#1E2531] text-[#EDEFF3] hover:text-[#16C784] border border-[#1E2531] rounded-lg transition-all duration-150 active:scale-95 shrink-0"
                title="Descargar desde Google Drive"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* CATEDRA TICKERS UPPER BAR */}
      <div className="bg-[#0F1420] border border-[#1E2531] rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16C784] animate-ping"></span>
            <span className="text-[9px] font-mono text-[#16C784] uppercase tracking-widest font-bold">TERMINAL DE ACCESO DIRECTO</span>
          </div>
          <h3 className="text-base font-bold text-[#EDEFF3] tracking-tight">Acceso Público y Conexión de Cátedras</h3>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Cátedras as "TICKERS" */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-[#131826] border border-[#1E2531] rounded-xl w-full md:w-auto">
            {activeCatedras.map(cat => {
              const isActive = selectedCatedra === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCatedra(cat.id);
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all duration-150 cursor-pointer flex-1 md:flex-none text-center ${
                    isActive
                      ? "bg-[#16C784]/15 text-[#16C784] border border-[#16C784]/25"
                      : "bg-transparent text-[#5B6577] border border-transparent hover:text-[#EDEFF3] hover:border-[#1E2531]"
                  }`}
                >
                  {getTickerCode(cat.id)}
                </button>
              );
            })}
          </div>

          {/* Connection Status Indicator */}
          <div className="shrink-0 flex items-center justify-center">
            {loading ? (
              <span className="px-3 py-1.5 text-[9px] font-mono bg-[#131826] border border-[#1E2531] text-[#5B6577] rounded-full flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin text-[#16C784]" />
                <span>SINC_DATA...</span>
              </span>
            ) : isDemoMode ? (
              <span className="px-3 py-1.5 text-[9px] font-mono bg-[#E24B4A]/10 text-[#E24B4A] border border-[#E24B4A]/20 rounded-full flex items-center gap-1.5 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E24B4A] animate-pulse"></span>
                <span>MODO_OFFLINE</span>
              </span>
            ) : (
              <span className="px-3 py-1.5 text-[9px] font-mono bg-[#16C784]/10 text-[#16C784] border border-[#16C784]/25 rounded-full flex items-center gap-1.5 font-bold animate-fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16C784]"></span>
                <span>SHEETS_EN_VIVO</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ERROR BANNER IF CONNECTIONS LOSE INTEGRITY */}
      {errorMsg && (
        <div className="bg-[#E24B4A]/10 border border-[#E24B4A]/25 text-[#E24B4A] rounded-xl p-4 flex items-start gap-3 animate-fade-in text-xs max-w-4xl mx-auto">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold uppercase font-mono tracking-wider text-[10px]">Alerta de Conexión:</p>
            <p className="text-[#EDEFF3]/80 leading-relaxed font-sans">
              No se pudo conectar con las planillas en vivo ({errorMsg}). Para mantener tu consulta activa, el sistema cargó la base de datos local y segura en modo offline.
            </p>
          </div>
        </div>
      )}

      {/* PORTAL CORE LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* DESKTOP SIDEBAR NAVIGATION */}
        <div className="hidden md:block md:col-span-1 space-y-2">
          <div className="bg-[#0F1420] border border-[#1E2531] rounded-2xl p-4 shadow-lg space-y-1">
            <p className="px-3 py-1.5 text-[9px] font-mono text-[#5B6577] uppercase tracking-widest mb-2 font-bold">
              TERMINAL MENU
            </p>
            {navigationItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                    isActive
                      ? "bg-[#16C784]/10 text-[#16C784] border-l-4 border-[#16C784] pl-2.5"
                      : "text-[#5B6577] hover:bg-[#131826] hover:text-[#EDEFF3]"
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? "text-[#16C784]" : "text-[#5B6577]"}`} />
                  <span className="uppercase tracking-wider font-mono text-[10px] font-bold">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* INFORMACIÓN DE LA MATERIA */}
          <div className="bg-[#0F1420] border border-[#1E2531] rounded-2xl p-4 shadow-lg space-y-3 font-mono text-[10px] text-[#5B6577]">
            <p className="text-[#EDEFF3] font-bold tracking-wider uppercase border-b border-[#1E2531] pb-1.5 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-[#16C784]" />
              <span>SISTEMA DE INFO</span>
            </p>
            <div className="space-y-1.5">
              <p><span className="text-[#5B6577]">CÓDIGO:</span> <span className="text-[#EDEFF3] font-mono">{getTickerCode(selectedCatedra)}</span></p>
              <p><span className="text-[#5B6577]">MATERIA:</span> <span className="text-[#EDEFF3]">{currentCatedra.nombre}</span></p>
              <p><span className="text-[#5B6577]">DICTADO:</span> <span className="text-[#EDEFF3]">{currentCatedra.cuatrimestre}</span></p>
              <p><span className="text-[#5B6577]">COHORTE:</span> <span className="text-[#EDEFF3]">{currentYear}</span></p>
            </div>
          </div>
        </div>

        {/* MAIN SECTION CONTENT AREA */}
        <div className="col-span-1 md:col-span-3 min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedCatedra}-${activeTab}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* SECTION HEADER CARD */}
              <div className="bg-[#0F1420] text-white rounded-2xl p-5 shadow-lg border border-[#1E2531] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[9px] font-mono tracking-widest text-[#16C784] uppercase font-bold bg-[#16C784]/15 px-2 py-0.5 rounded border border-[#16C784]/20">
                      {getTickerCode(selectedCatedra)}
                    </span>
                    <span className="text-[10px] text-[#5B6577] font-mono">•</span>
                    <span className="text-[10px] font-mono text-[#5B6577] uppercase">COHORTE {currentYear}</span>
                  </div>
                  <h2 className="text-lg font-bold tracking-tight text-[#EDEFF3] uppercase font-mono">{activeTab === "inicio" ? "Cátedra & Programa" : activeTab === "archivos" ? "Descarga de Archivos" : activeTab}</h2>
                </div>
              </div>

                {/* 1. INICIO (PROGRAMA Y CONDICIONES JUNTOS) */}
              {activeTab === "inicio" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-[#0F1420] border border-[#1E2531] rounded-2xl p-6 shadow-lg space-y-4">
                      <h4 className="font-bold text-[#EDEFF3] flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-[#5B6577]">
                        <span>PROGRAMA GENERAL</span>
                      </h4>
                      {(() => {
                        const text = seccionesCatedra.find(s => s.seccion === "Programa")?.texto_simple;
                        const hasFiles = archivosList.some(a => a.id_catedra === selectedCatedra && a.tipo_seccion === "Programa");

                        if (!text && !hasFiles) {
                          return (
                            <p className="text-[#EDEFF3]/90 leading-relaxed text-sm font-sans">
                              El programa oficial de la asignatura se encuentra actualmente en edición o actualización por los coordinadores académicos.
                            </p>
                          );
                        }

                        return (
                          <>
                            {text && (
                              <p className="text-[#EDEFF3]/90 leading-relaxed text-sm font-sans">
                                {text}
                              </p>
                            )}
                            {hasFiles && renderFileListOnly("Programa")}
                          </>
                        );
                      })()}
                    </div>
 
                    <div className="bg-[#0F1420] border border-[#1E2531] rounded-2xl p-6 shadow-lg space-y-4">
                      <h4 className="font-bold text-[#EDEFF3] flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-[#5B6577]">
                        <span>CONDICIONES DE CURSADA</span>
                      </h4>
                      {(() => {
                        const text = seccionesCatedra.find(s => s.seccion === "Condiciones de Cursada")?.texto_simple;
                        const hasFiles = archivosList.some(a => a.id_catedra === selectedCatedra && a.tipo_seccion === "Condiciones_Cronograma");

                        if (!text && !hasFiles) {
                          return (
                            <p className="text-[#EDEFF3]/90 leading-relaxed text-sm font-sans">
                              Las normativas de regularidad, régimen de promoción directa y aprobación del proyecto final se encuentran publicadas en la cartelera física del departamento académico.
                            </p>
                          );
                        }

                        return (
                          <>
                            {text && (
                              <p className="text-[#EDEFF3]/90 leading-relaxed text-sm font-sans">
                                {text}
                              </p>
                            )}
                            {hasFiles && renderFileListOnly("Condiciones_Cronograma")}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
 
              {/* 2. ARCHIVOS (CON FILTRO INTERNO) */}
              {activeTab === "archivos" && (
                <div className="space-y-4 animate-fade-in">
                  {/* File category switcher - Ticker Style */}
                  <div className="flex gap-1.5 p-1 bg-[#131826] border border-[#1E2531] rounded-xl overflow-x-auto">
                    {[
                      { id: "Programa", label: "Programa" },
                      { id: "Condiciones_Cronograma", label: "Condiciones" },
                      { id: "Bibliografia", label: "Bibliografía" },
                      { id: "Diapositivas", label: "Diapositivas" },
                      { id: "Apuntes_Clase", label: "Apuntes" }
                    ].map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => setActiveFileSubSection(sub.id as any)}
                        className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all flex-1 text-center whitespace-nowrap cursor-pointer ${
                          activeFileSubSection === sub.id
                            ? "bg-[#1E2531] text-[#EDEFF3] border border-[#232B3D]"
                            : "text-[#5B6577] hover:text-[#EDEFF3]"
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
 
                  {renderArchivosSection(activeFileSubSection)}
                </div>
              )}

              {/* 3. CRONOGRAMA */}
              {activeTab === "cronograma" && renderCronograma()}

              {/* 4. RENDIMIENTO (BUSCADOR + BOLETÍN & ASISTENCIA UNIFICADOS EN UN TRADING DASHBOARD) */}
              {activeTab === "rendimiento" && (
                <div className="space-y-6">
                  {/* Buscador de alumnos */}
                  <div className="bg-[#0F1420] border border-[#1E2531] rounded-2xl p-6 shadow-lg space-y-4">
                    <div className="max-w-md mx-auto text-center space-y-2 mb-2">
                      <h4 className="font-bold text-[#EDEFF3] text-sm uppercase tracking-wider font-mono">Consola de Rendimiento</h4>
                      <p className="text-xs text-[#5B6577] leading-relaxed font-sans">
                        Consulta tu asistencia de clases prácticas y calificaciones de evaluaciones parciales y condiciones finales.
                      </p>
                    </div>

                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-2 text-[#5B6577] text-xs font-mono">
                        <Loader2 className="w-5 h-5 animate-spin text-[#16C784]" />
                        <span>SINC_DATA_BASE...</span>
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

                  {/* UNIFIED TRADING PERFORMANCE CARD */}
                  {selectedStudent && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-[#0F1420] border border-[#1E2531] rounded-2xl overflow-hidden shadow-2xl max-w-2xl mx-auto"
                    >
                      {/* CARD HEADER */}
                      <div className="bg-[#131826] p-4 border-b border-[#1E2531] text-white flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[#16C784] flex items-center justify-center font-bold font-mono">
                            {selectedStudent.split(" ").map(w => w.charAt(0)).join("").substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[9px] font-mono text-[#5B6577] uppercase tracking-widest">Padrón / Estudiante</p>
                            <h5 className="font-bold text-sm text-[#EDEFF3]">{selectedStudent}</h5>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-mono text-[#5B6577] uppercase tracking-widest mb-1">Estado Final</p>
                          {(() => {
                            const finalCond = selectedCatedra !== "TECNO_3" 
                              ? studentGradesNum?.condicion_final 
                              : studentGradesStatus?.condicion_final;

                            const cleanCond = (finalCond || "").toUpperCase().trim();
                            const isPromocion = cleanCond === "PROMOCIÓN" || cleanCond === "PROMOCION";
                            const isRegular = cleanCond === "REGULAR";
                            
                            const colorClass = isPromocion 
                              ? "text-[#16C784] bg-[#16C784]/15 border-[#16C784]/25" 
                              : isRegular 
                                ? "text-[#F0997B] bg-[#F0997B]/15 border-[#F0997B]/25" 
                                : "text-[#E24B4A] bg-[#E24B4A]/15 border-[#E24B4A]/25";

                            return (
                              <span className={`px-3.5 py-1 rounded-md text-base font-mono font-bold uppercase border inline-block ${colorClass}`}>
                                {finalCond || "N/A"}
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                      {/* CARD BODY */}
                      <div className="p-5 space-y-6">
                        
                        {/* SECTION A: ASISTENCIA (VISUAL VARIATION INDICATOR) */}
                        <div className="bg-[#131826]/60 border border-[#1E2531]/80 rounded-xl p-4 space-y-3.5">
                          {(() => {
                            const currentCatedraObj = (catedras || []).find(c => c.id === selectedCatedra);
                            const totalClases = currentCatedraObj?.total_clases ?? 10;
                            const pct = studentAttendance 
                              ? Math.round((studentAttendance.presentes / totalClases) * 100)
                              : 0;
                            const formattedPct = `${pct}%`;

                            return (
                              <>
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-[9px] font-mono text-[#5B6577] uppercase tracking-wider font-bold">ASISTENCIA EN CURSADA</p>
                                    <h4 className="text-xs text-[#EDEFF3] font-sans font-medium">Clases Prácticas Requeridas</h4>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-2xl font-bold text-[#EDEFF3] font-mono tracking-tight">
                                      {studentAttendance ? formattedPct : "0%"}
                                    </span>
                                  </div>
                                </div>

                                {/* Horizontal Price-Variation Progress Bar */}
                                {studentAttendance ? (
                                  (() => {
                                    const req = selectedCatedra === "BIO_MOL" ? 80 : 75;
                                    const cumple = pct >= req;
                                    const colorHex = cumple ? "#16C784" : "#E24B4A";

                                    return (
                                      <div className="space-y-3">
                                        {/* Progress bar line */}
                                        <div className="w-full h-1.5 bg-[#1E2531] rounded-full overflow-hidden">
                                          <div 
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ 
                                              width: `${pct}%`,
                                              backgroundColor: colorHex
                                            }}
                                          ></div>
                                        </div>

                                        {/* Sub-text indicating detail of attendance */}
                                        <div className="flex justify-between items-center text-[10px] font-mono text-[#5B6577]">
                                          <span>Detalle de asistencias:</span>
                                          <span className="font-semibold text-[#EDEFF3]">
                                            {studentAttendance.presentes} de {totalClases} clases
                                          </span>
                                        </div>

                                        {/* Compliance Badge / Variation Quote */}
                                        <div className={`p-3 rounded-lg bg-[#0F1420] border border-[#1E2531] flex justify-between items-center text-xs`}>
                                          <span className="font-mono text-[9px] text-[#5B6577] uppercase tracking-wider">Cumplimiento Mínimo ({req}%)</span>
                                          {cumple ? (
                                            <span className="font-mono font-bold text-[#16C784] flex items-center gap-1 bg-[#16C784]/10 px-2 py-0.5 rounded border border-[#16C784]/20">
                                              ▲ CUMPLE REQUISITO
                                            </span>
                                          ) : (
                                            <span className="font-mono font-bold text-[#E24B4A] flex items-center gap-1 bg-[#E24B4A]/10 px-2 py-0.5 rounded border border-[#E24B4A]/20 animate-pulse">
                                              ▼ INSUFICIENTE
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })()
                                ) : (
                                  <p className="text-xs text-[#5B6577] italic font-sans text-center">No se registraron planillas de asistencia para este alumno.</p>
                                )}
                              </>
                            );
                          })()}
                        </div>

                        {/* SECTION B: CALIFICACIONES (TICKS/QUOTES PANEL) */}
                        <div className="space-y-3">
                          <p className="text-[9px] font-mono text-[#5B6577] uppercase tracking-wider font-bold">PANEL DE COTIZACIÓN DE NOTAS</p>
                          
                          {/* CASO: ESQUEMA NUMÉRICO (BIO_MOL / TECNO II) */}
                          {selectedCatedra !== "TECNO_3" ? (
                            studentGradesNum ? (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                
                                {/* P1 Card */}
                                <div className="p-3.5 bg-[#131826]/70 border border-[#1E2531] rounded-xl space-y-2.5">
                                  <div className="flex justify-between items-start">
                                    <span className="text-[9px] font-mono text-[#5B6577] uppercase tracking-wider font-bold">1ER PARCIAL</span>
                                    <span className="text-[10px] font-mono font-bold text-[#16C784] bg-[#16C784]/10 px-1.5 py-0.5 rounded">
                                      {studentGradesNum.p1_resultado}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-baseline pt-1">
                                    <span className="text-[10px] font-mono text-[#5B6577]">TEO:</span>
                                    <span className="text-lg font-bold font-mono text-[#EDEFF3]">{studentGradesNum.p1_teoria}</span>
                                    <span className="text-[10px] font-mono text-[#5B6577] ml-2">PRAC:</span>
                                    <span className="text-lg font-bold font-mono text-[#EDEFF3]">{studentGradesNum.p1_practica}</span>
                                  </div>
                                </div>

                                {/* P2 Card */}
                                <div className="p-3.5 bg-[#131826]/70 border border-[#1E2531] rounded-xl space-y-2.5">
                                  <div className="flex justify-between items-start">
                                    <span className="text-[9px] font-mono text-[#5B6577] uppercase tracking-wider font-bold">2DO PARCIAL</span>
                                    <span className="text-[10px] font-mono font-bold text-[#16C784] bg-[#16C784]/10 px-1.5 py-0.5 rounded">
                                      {studentGradesNum.p2_resultado}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-baseline pt-1">
                                    <span className="text-[10px] font-mono text-[#5B6577]">TEO:</span>
                                    <span className="text-lg font-bold font-mono text-[#EDEFF3]">{studentGradesNum.p2_teoria}</span>
                                    <span className="text-[10px] font-mono text-[#5B6577] ml-2">PRAC:</span>
                                    <span className="text-lg font-bold font-mono text-[#EDEFF3]">{studentGradesNum.p2_practica}</span>
                                  </div>
                                </div>

                                {/* Rec Card */}
                                <div className="p-3.5 bg-[#131826]/70 border border-[#1E2531] rounded-xl space-y-2.5">
                                  <div className="flex justify-between items-start">
                                    <span className="text-[9px] font-mono text-[#5B6577] uppercase tracking-wider font-bold">RECUPERATORIO</span>
                                    <span className="text-[10px] font-mono font-bold text-[#F0997B] bg-[#F0997B]/10 px-1.5 py-0.5 rounded uppercase">
                                      {studentGradesNum.recupera || "N/C"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-baseline pt-1">
                                    <span className="text-[10px] font-mono text-[#5B6577]">TEO:</span>
                                    <span className="text-lg font-bold font-mono text-[#EDEFF3]">{studentGradesNum.rec_teoria || "-"}</span>
                                    <span className="text-[10px] font-mono text-[#5B6577] ml-2">PRAC:</span>
                                    <span className="text-lg font-bold font-mono text-[#EDEFF3]">{studentGradesNum.rec_practica || "-"}</span>
                                  </div>
                                </div>

                              </div>
                            ) : (
                              <p className="text-xs text-[#5B6577] italic text-center font-sans py-2">No se registraron notas para este alumno.</p>
                            )
                          ) : (
                            /* CASO: ESQUEMA CUALITATIVO (TECNO III) */
                            studentGradesStatus ? (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  
                                  {/* P1 Teorico Card */}
                                  <div className="p-3.5 bg-[#131826]/70 border border-[#1E2531] rounded-xl space-y-1.5">
                                    <span className="text-[9px] font-mono text-[#5B6577] uppercase tracking-wider font-bold block">1ER PARCIAL TEO</span>
                                    <div className="flex justify-between items-baseline pt-1">
                                      <span className="text-lg font-bold font-mono text-[#EDEFF3]">{studentGradesStatus.p1_teoria}</span>
                                      <span className="text-[10px] font-mono text-[#16C784] bg-[#16C784]/10 px-1.5 py-0.5 rounded">
                                        {studentGradesStatus.p1_condicion}
                                      </span>
                                    </div>
                                  </div>

                                  {/* P2 Teorico Card */}
                                  <div className="p-3.5 bg-[#131826]/70 border border-[#1E2531] rounded-xl space-y-1.5">
                                    <span className="text-[9px] font-mono text-[#5B6577] uppercase tracking-wider font-bold block">2DO PARCIAL TEO</span>
                                    <div className="flex justify-between items-baseline pt-1">
                                      <span className="text-lg font-bold font-mono text-[#EDEFF3]">{studentGradesStatus.p2_teoria}</span>
                                      <span className="text-[10px] font-mono text-[#16C784] bg-[#16C784]/10 px-1.5 py-0.5 rounded">
                                        {studentGradesStatus.p2_condicion}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Recuperatorio Card */}
                                  <div className="p-3.5 bg-[#131826]/70 border border-[#1E2531] rounded-xl space-y-1.5">
                                    <span className="text-[9px] font-mono text-[#5B6577] uppercase tracking-wider font-bold block">RECUPERATORIOS</span>
                                    <div className="flex justify-between items-baseline pt-1">
                                      <span className="text-lg font-bold font-mono text-[#EDEFF3]">{studentGradesStatus.rec_teoria || "-"}</span>
                                      <span className="text-[10px] font-mono text-[#F0997B] bg-[#F0997B]/10 px-1.5 py-0.5 rounded">
                                        {studentGradesStatus.rec_condicion || "N/A"}
                                      </span>
                                    </div>
                                  </div>

                                </div>

                                <div className="p-4 bg-[#131826]/70 border border-[#1E2531] rounded-xl flex justify-between items-center">
                                  <div>
                                    <p className="text-[9px] font-mono text-[#5B6577] uppercase tracking-wider font-bold">RENDIMIENTO PRÁCTICO</p>
                                    <h5 className="font-semibold text-[#EDEFF3] text-xs font-sans">Proyecto Global Troncal</h5>
                                  </div>
                                  <span className={`px-3 py-1 rounded text-xs font-mono font-bold border ${
                                    studentGradesStatus.practica === "Aprobado"
                                      ? "text-[#16C784] bg-[#16C784]/15 border-[#16C784]/20"
                                      : "text-[#F0997B] bg-[#F0997B]/15 border-[#F0997B]/20"
                                  }`}>
                                    {studentGradesStatus.practica}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-[#5B6577] italic text-center font-sans py-2">No se registraron notas para este alumno.</p>
                            )
                          )}
                        </div>

                      </div>
                    </motion.div>
                  )}
                </div>
              )}
              
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* PERSISTENT BOTTOM NAVIGATION BAR FOR MOBILE (THUMBS-FRIENDLY ACCESSIBILITY) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0F1420]/95 backdrop-blur-md border-t border-[#1E2531] md:hidden shadow-2xl">
        <div className="flex justify-around items-center h-16">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center w-full h-full transition-all active:scale-95 duration-100 ${
                  isActive ? "text-[#16C784] font-bold" : "text-[#5B6577] hover:text-[#EDEFF3]"
                }`}
              >
                <Icon className="w-5 h-5 mb-1 shrink-0" />
                <span className="text-[9px] font-mono uppercase tracking-wider">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
