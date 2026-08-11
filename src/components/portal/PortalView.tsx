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
  MessageSquare,
  Menu,
  FileCode,
  User,
  Check,
  ArrowLeft
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
  getCronogramaClasesFromSheet,
  isValidGoogleSheetId
} from "../../services/googleSheets";
import { Asistencia, NotaNum, NotaStatus, ClaseCronograma } from "../../types";
import StudentSearch from "./StudentSearch";
import RemindWidget from "./RemindWidget";
import { CALENDARIO_ACADEMICO_CONFIG, getCalendarioDownloadUrl } from "../../config/calendarioAcademico";

const ACADEMIC_INTRODUCTIONS: Record<string, string[]> = {
  BIO_MOL: [
    "La Biología Molecular constituye una disciplina científica trascendental en el panorama académico contemporáneo, habiendo aportado los fundamentos esenciales para la comprensión de los procesos moleculares inherente a la herencia y transmisión de la información genética. Su inclusión en el plan de estudios de las carreras de Bioquímica y en la de Farmacia, resulta imperativa, dado que las metodologías y avances tecnológicos que caracterizan los laboratorios modernos se sustentan directamente en los hallazgos propiciados por esta ciencia.",
    "El programa académico tiene como propósito fundamental instruir al estudiantado en los principios teóricos y prácticos de la disciplina, desarrollando competencias para la interpretación crítica de la literatura científica de vanguardia y fomentando la generación de grupos de investigación interdisciplinados. Asimismo, la asignatura se erige como herramienta transversal en el ejercicio profesional, capacitando al futuro bioquímico para responder con solvencia a las exigencias del ámbito de la salud y la investigación clínica mediante una sólida formación científica."
  ],
  TECNO_2: [
    "La Tecnicatura Universitaria en Biogenética exige de sus egresados un dominio riguroso de los marcos teóricos, químicos y físicos que fundamentan las metodologías instrumentales de mayor aplicación en el contexto laboratorial. En este marco, la asignatura Tecnología de Laboratorio II se configura como un eje estructural del plan de estudios, toda vez que garantiza la transmisión sistematizada de saberes especializados indispensables para el desempeño profesional. Paralelamente, dicha asignatura proporciona el ámbito empírico idóneo para la consolidación de competencias prácticas, permitiendo al estudiante operar con solvencia frente a los procedimientos técnicos que definen el campo de incumbencia de la carrera. De este modo, la disciplina opera como puente articulador entre la formación teórica y la práctica profesional, asegurando que el egresado posea las herramientas conceptuales y operativas necesarias para responder a las demandas del ámbito biogenético con precisión y eficiencia."
  ],
  TECNO_3: [
    "La presente asignatura constituye un pilar fundamental para la etapa de finalización de la Tecnicatura Universitaria en Biogenética, por cuanto proporciona los marcos teóricos y prácticos inherentes a las metodologías de mayor complejidad que caracterizan el quehacer laboratorial contemporáneo. Se sitúa estratégicamente en el segundo cuatrimestre del tercer año del plan de estudios, articulando de manera sintética los saberes previamente adquiridos en Tecnología de Laboratorio II y Genética de los Microorganismos, y estableciendo, a su vez, la base técnica e instrumental indispensable para el óptimo desarrollo del Practicanato profesional. Su trascendencia radica específicamente en capacitar al estudiantado en el manejo solvente y crítico de los fundamentos químicos y físicos que rigen las técnicas instrumentales de vanguardia, permitiéndoles manipular con rigor y precisión los elementos conceptuales y operativos necesarios para responder a las exigencias del desarrollo científico moderno."
  ]
};

interface PortalViewProps {
  onBackToHome?: () => void;
  initialCatedraId?: string;
}

export default function PortalView({ onBackToHome, initialCatedraId }: PortalViewProps) {
  const [catedras, setCatedras] = useState<any[]>(mockCatedras);
  const [secciones, setSecciones] = useState<any[]>(mockSecciones);
  const [archivosList, setArchivosList] = useState<any[]>(mockArchivos);

  const activeCatedras = catedras.filter(c => c.activa);
  
  const [selectedCatedra, setSelectedCatedra] = useState<string>(
    initialCatedraId || (activeCatedras.length > 0 ? activeCatedras[0].id : "BIO_MOL")
  );

  useEffect(() => {
    if (initialCatedraId) {
      setSelectedCatedra(initialCatedraId);
    }
  }, [initialCatedraId]);

  
  // Navigation tabs: 'inicio' | 'archivos' | 'cronograma' | 'rendimiento' | 'comunicacion'
  const [activeTab, setActiveTab] = useState<"inicio" | "archivos" | "cronograma" | "rendimiento" | "comunicacion">("inicio");
  
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

  // Mobile menu sidebar toggle state
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Alumno seleccionado por el buscador
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const currentCatedra = catedras.find(c => c.id === selectedCatedra) || activeCatedras[0] || mockCatedras[0];
  const currentYear = currentCatedra?.anio_vigente || 2026;

  // Carga de configuración dinámica desde la planilla del Panel Docente si está definida
  useEffect(() => {
    const loadPanelConfig = async () => {
      const panelConfigId = import.meta.env.VITE_SHEET_ID_PANEL_CONFIG;

      if (!isValidGoogleSheetId(panelConfigId)) {
        console.info("ℹ️ [CONFIG] El ID 'VITE_SHEET_ID_PANEL_CONFIG' no está configurado o es inválido. Usando datos locales por defecto.");
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

        const activeCats = enrichedCatedras.filter(c => c.activa);
        if (activeCats.length > 0 && !activeCats.some(c => c.id === selectedCatedra)) {
          setSelectedCatedra(activeCats[0].id);
        }
        console.info("✅ [CONFIG] Configuración del panel docente cargada con éxito.");
      } catch (err: any) {
        console.warn("⚠️ [CONFIG] No se pudo cargar configuración en vivo desde el panel docente:", err);
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
        const sheetName = currentCatedra.id;
        
        if (!spreadsheetId || spreadsheetId.startsWith("TU_ID_AQUI")) {
          const mockClasesBioMol: ClaseCronograma[] = [
            {
              fecha: new Date(2026, 7, 18),
              fechaTexto: "18 de Agosto",
              horario: "8:30 a 12:00",
              aula: "Aula 102",
              tema: "Clase 1: Introducción a la Genética Molecular y Estructura del ADN.",
              tipo: "Normal"
            },
            {
              fecha: new Date(2026, 8, 15),
              fechaTexto: "15 de Septiembre",
              horario: "8:30 a 12:00",
              aula: "Aula 102",
              tema: "Clase 5: Primer Parcial Teórico-Práctico Integrador.",
              tipo: "Normal"
            },
            {
              fecha: new Date(2026, 9, 20),
              fechaTexto: "20 de Octubre",
              horario: "8:30 a 12:00",
              aula: "Aula 102",
              tema: "Clase 9: Segundo Parcial Teórico-Práctico.",
              tipo: "Normal"
            },
            {
              fecha: new Date(2026, 10, 11),
              fechaTexto: "11 de Noviembre",
              horario: "8:30 a 12:00",
              aula: "Aula 102 / Laboratorio",
              tema: "Examen Recuperatorio Teórico-Práctico Integrador de Cátedra.",
              tipo: "Extra"
            }
          ];

          const mockClasesTecno3: ClaseCronograma[] = [
            {
              fecha: new Date(2026, 7, 20),
              fechaTexto: "20 de Agosto",
              horario: "14:00 a 18:00",
              aula: "Laboratorio A",
              tema: "Clase 1: Introducción a la Tecnología de Laboratorio III.",
              tipo: "Normal"
            },
            {
              fecha: new Date(2026, 8, 17),
              fechaTexto: "17 de Septiembre",
              horario: "14:00 a 18:00",
              aula: "Laboratorio A",
              tema: "Clase 5: Evaluación del Proyecto Troncal - Hito 1.",
              tipo: "Normal"
            },
            {
              fecha: new Date(2026, 9, 22),
              fechaTexto: "22 de Octubre",
              horario: "14:00 a 18:00",
              aula: "Laboratorio A",
              tema: "Clase 9: Evaluación del Proyecto Troncal - Hito 2 y Defensa Oral.",
              tipo: "Normal"
            },
            {
              fecha: new Date(2026, 10, 11),
              fechaTexto: "11 de Noviembre",
              horario: "14:00 a 18:00",
              aula: "Laboratorio A / B",
              tema: "Examen Recuperatorio Teórico-Práctico e Integrador de Cátedra.",
              tipo: "Extra"
            }
          ];

          const mockClasesDefault: ClaseCronograma[] = [
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
              fecha: new Date(2026, 10, 11),
              fechaTexto: "11 de Noviembre",
              horario: "14:00 a 16:00",
              aula: "Laboratorio B",
              tema: "Examen Recuperatorio Teórico-Práctico Integrador.",
              tipo: "Extra"
            }
          ];

          let mockClases = mockClasesDefault;
          if (selectedCatedra === "BIO_MOL") {
            mockClases = mockClasesBioMol;
          } else if (selectedCatedra === "TECNO_3") {
            mockClases = mockClasesTecno3;
          }
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

  // 5 main navigation tabs
  const navigationItems = [
    { id: "inicio", label: "Inicio", icon: BookOpen },
    { id: "archivos", label: "Descargas", icon: FileText },
    { id: "cronograma", label: "Cronograma", icon: Calendar },
    { id: "rendimiento", label: "Asistencia y Notas", icon: Award },
    { id: "comunicacion", label: "Comunicación", icon: MessageSquare },
  ] as const;

  // Render text-based, timeline list or embedded calendar
  const renderCronograma = () => {
    if (currentCatedra.tipo_cronograma === "TEXTO_SIMPLE") {
      return (
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 md:p-8 shadow-2xs space-y-4 animate-fade-in">
          <h4 className="font-bold flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-stone-600">
            <span>CRONOGRAMA DE CURSADA</span>
          </h4>
          <p className="text-stone-800 leading-relaxed text-base font-sans">
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
        { sem: "11 de Noviembre", desc: "Examen Recuperatorio Teórico-Práctico Integrador de Cátedra" },
      ];

      const fechasTecno3 = [
        { sem: "Semana 1", desc: "Presentación del Programa y Metodologías de Tecnología de Laboratorio III" },
        { sem: "Semana 4", desc: "Taller Práctico de Procesamiento y Técnicas de Laboratorio Avanzadas" },
        { sem: "Semana 8", desc: "Evaluación del Proyecto Troncal - Hito 1" },
        { sem: "Semana 12", desc: "Evaluación del Proyecto Troncal - Hito 2 y Defensa Oral" },
        { sem: "11 de Noviembre", desc: "Examen Recuperatorio Teórico-Práctico e Integrador de Cátedra" },
      ];

      const fechas = selectedCatedra === "TECNO_3" ? fechasTecno3 : fechasBio;

      return (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 md:p-8 shadow-2xs">
            <h4 className="font-bold text-stone-600 mb-6 flex items-center gap-2 text-xs uppercase tracking-widest font-mono">
              <span>HITOS Y FECHAS CLAVE</span>
            </h4>
            <div className="relative border-l-2 border-stone-200 pl-6 ml-3 space-y-8">
              {fechas.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#60290A] border-4 border-white shadow-2xs"></div>
                  <span className="font-mono text-xs font-bold text-[#60290A] bg-amber-100/80 px-3 py-1 rounded-md border border-amber-300 uppercase tracking-wider">
                    {item.sem}
                  </span>
                  <p className="text-stone-800 mt-3 text-base leading-relaxed font-sans font-medium">{item.desc}</p>
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
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 md:p-8 shadow-2xs">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
              <h4 className="font-bold flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-stone-600">
                <span>CALENDARIO INTEGRADO</span>
              </h4>
              {isGoogleCalendarUrl && (
                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#60290A] hover:underline font-mono uppercase tracking-wider font-bold"
                >
                  <span>Abrir Ventana</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            <div className="aspect-video w-full rounded-2xl border border-stone-200 overflow-hidden bg-stone-50 flex items-center justify-center relative min-h-[360px]">
              {isGoogleCalendarUrl ? (
                <iframe
                  src={calendarUrl}
                  className="absolute inset-0 w-full h-full border-none opacity-100"
                  title="Calendario Cátedra"
                ></iframe>
              ) : (
                <div className="text-center p-6 space-y-2">
                  <Calendar className="w-10 h-10 text-stone-400 mx-auto opacity-50" />
                  <p className="text-sm text-stone-600 italic font-sans">
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
          <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center shadow-2xs animate-fade-in flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#60290A] animate-spin" />
            <p className="text-xs text-stone-600 font-mono uppercase tracking-wider font-semibold">Cargando cronograma de clases...</p>
          </div>
        );
      }

      if (cronogramaError) {
        return (
          <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center shadow-2xs animate-fade-in space-y-3">
            <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
            <p className="text-sm text-rose-700 font-sans">{cronogramaError}</p>
          </div>
        );
      }

      if (!clasesCronograma || clasesCronograma.length === 0) {
        return (
          <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center shadow-2xs animate-fade-in space-y-2">
            <Calendar className="w-8 h-8 text-stone-400 mx-auto opacity-50" />
            <p className="text-sm text-stone-600 font-sans italic">
              Cronograma todavía no cargado para esta cátedra.
            </p>
          </div>
        );
      }

      return (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 md:p-8 shadow-2xs">
            <h4 className="font-bold text-stone-600 mb-6 flex items-center gap-2 text-xs uppercase tracking-widest font-mono">
              <span>CRONOGRAMA DETALLADO DE CLASES</span>
            </h4>
            
            <div className="relative border-l-2 border-stone-200 pl-6 ml-3 space-y-8">
              {clasesCronograma.map((clase, idx) => {
                const isFeriado = clase.tipo === "Feriado";
                const isExtra = clase.tipo === "Extra";

                const rawHorario = (clase.horario || "").trim();
                const displayHorario = rawHorario
                  ? (rawHorario.toLowerCase().startsWith("horario:") 
                      ? rawHorario 
                      : `Horario: ${rawHorario}`)
                  : "";

                const rawAula = (clase.aula || "").trim();
                const displayAula = rawAula
                  ? (rawAula.toLowerCase().startsWith("aula:") || rawAula.toLowerCase().startsWith("aula del 3er mod.:")
                      ? rawAula 
                      : `Aula: ${rawAula}`)
                  : "";

                const rawTema = (clase.tema || "").trim();
                const displayTema = rawTema
                  ? (rawTema.toLowerCase().startsWith("tema:") 
                      ? rawTema 
                      : `Tema: ${rawTema}`)
                  : "";

                return (
                  <div key={idx} className={`relative group ${isFeriado ? "opacity-60" : ""}`}>
                    <div className={`absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-2xs 
                      ${isFeriado 
                        ? "bg-stone-400" 
                        : isExtra 
                          ? "bg-amber-600 animate-pulse" 
                          : "bg-[#60290A]"}`}
                    ></div>

                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-mono text-sm font-bold text-stone-900">
                        {clase.fechaTexto}
                      </span>
                      
                      {!isFeriado && rawHorario && (
                        <span className="font-mono text-xs text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200 font-medium">
                          {displayHorario}
                        </span>
                      )}

                      {!isFeriado && rawAula && (
                        <span className="font-mono text-xs text-[#60290A] bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-300 font-semibold">
                          {displayAula}
                        </span>
                      )}

                      {isExtra && (
                        <span className="font-mono text-xs font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-lg border border-amber-300 uppercase tracking-wider">
                          CLASE EXTRA
                        </span>
                      )}

                      {isFeriado && (
                        <span className="font-mono text-xs font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200 uppercase tracking-wider">
                          Feriado / Sin Clase
                        </span>
                      )}
                    </div>

                    <p className="text-stone-800 text-base leading-relaxed font-sans max-w-3xl font-normal">
                      {isFeriado ? (
                        <span className="italic text-stone-400">Sin clase (feriado)</span>
                      ) : (
                        displayTema
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

  // Render a clean list of files with exact PDF icon styling from Screenshot 2
  const renderArchivosSection = (tipo: "Bibliografia" | "Diapositivas" | "Apuntes_Clase" | "Programa" | "Condiciones_Cronograma") => {
    const seccionConfigName = 
      tipo === "Bibliografia" ? "Bibliografía" : 
      tipo === "Diapositivas" ? "Diapositivas" : 
      tipo === "Apuntes_Clase" ? "Apuntes de Clase" :
      tipo === "Programa" ? "Programa" : "Condiciones de Cursada";
    const seccionConfig = seccionesCatedra.find(s => s.seccion === seccionConfigName);

    if (seccionConfig?.estado === "Inactiva") {
      return (
        <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-4 animate-fade-in shadow-2xs">
          <Info className="w-10 h-10 text-stone-400 mx-auto" />
          <div>
            <h5 className="font-bold text-stone-900 text-base uppercase tracking-wider">Sección en Preparación</h5>
            <p className="text-sm text-stone-600 leading-relaxed mt-2 font-sans">
              {seccionConfig.texto_simple || "Esta sección se encuentra temporalmente inactiva o en proceso de edición por el equipo docente de la cátedra."}
            </p>
          </div>
        </div>
      );
    }

    const isDynamicSection = tipo === "Bibliografia" || tipo === "Diapositivas" || tipo === "Apuntes_Clase";
    const matchedFolder = isDynamicSection 
      ? carpetasDrive.find(c => c.id_catedra === selectedCatedra && c.tipo_seccion === tipo)
      : null;
    const hasDriveFolder = !!(matchedFolder?.folder_id_drive && matchedFolder.folder_id_drive.trim() !== "");

    if (isDynamicSection && hasDriveFolder) {
      if (driveLoading) {
        return (
          <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4 animate-fade-in shadow-2xs">
            <Loader2 className="w-8 h-8 text-[#60290A] mx-auto animate-spin" />
            <p className="text-xs text-stone-600 font-mono uppercase tracking-wider font-semibold">Cargando archivos desde Google Drive...</p>
          </div>
        );
      }

      if (driveError) {
        return (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-lg mx-auto space-y-4 animate-fade-in">
            <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
            <div>
              <h5 className="font-bold text-rose-800 text-xs uppercase tracking-wider font-mono">Error de Sincronización</h5>
              <p className="text-sm text-rose-700 mt-2 font-sans leading-relaxed">
                {driveError}
              </p>
            </div>
          </div>
        );
      }

      if (driveFiles.length === 0) {
        return (
          <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-4 animate-fade-in shadow-2xs">
            <FileText className="w-10 h-10 text-stone-400 mx-auto opacity-50" />
            <div>
              <h5 className="font-bold text-stone-900 text-base uppercase tracking-wider font-sans">Carpeta sin archivos</h5>
              <p className="text-sm text-stone-600 leading-relaxed mt-2 font-sans">
                No se encontraron archivos en la carpeta de Google Drive configurada para esta sección.
              </p>
            </div>
          </div>
        );
      }

      const sortedDriveFiles = [...driveFiles];
      if (selectedCatedra === "BIO_MOL" && tipo === "Diapositivas") {
        sortedDriveFiles.sort((a, b) => {
          const nameA = a.nombre_archivo || "";
          const nameB = b.nombre_archivo || "";
          return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
        });
      }

      return (
        <div className="space-y-3 animate-fade-in">
          {sortedDriveFiles.map((file, idx) => (
            <div
              key={file.id || idx}
              className="bg-white border border-stone-200/90 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-2xs hover:shadow-xs transition-all duration-200 min-h-[68px]"
            >
              <div className="flex items-center gap-4 truncate max-w-[80%]">
                <div className="w-12 h-12 rounded-xl bg-[#60290A] text-amber-50 flex flex-col items-center justify-center shrink-0 shadow-2xs font-mono">
                  <FileText className="w-5 h-5 text-amber-200 mb-0.5" />
                  <span className="text-[9px] font-bold tracking-widest leading-none uppercase">PDF</span>
                </div>
                <div className="space-y-0.5 truncate">
                  <h5 className="font-bold text-stone-900 text-base truncate font-sans" title={file.nombre_archivo}>
                    {file.nombre_archivo}
                  </h5>
                  <p className="text-xs text-stone-500 font-mono uppercase tracking-wider font-semibold">
                    PUBLICADO: <span className="font-mono">{file.fecha_subida}</span>
                  </p>
                </div>
              </div>
              <a
                href={file.link_drive}
                target="_blank"
                rel="noreferrer"
                className="w-11 h-11 flex items-center justify-center bg-[#60290A] hover:bg-[#471E07] text-white rounded-xl transition-all duration-200 active:scale-95 shadow-2xs cursor-pointer shrink-0"
                title="Descargar archivo"
              >
                <Download className="w-5 h-5" />
              </a>
            </div>
          ))}
        </div>
      );
    }

    // Fallback: listado manual desde la planilla
    const archivos = archivosList
      .filter(a => a.id_catedra === selectedCatedra && a.tipo_seccion === tipo);

    if (selectedCatedra === "BIO_MOL" && tipo === "Diapositivas") {
      archivos.sort((a, b) => {
        const nameA = a.nombre_archivo || "";
        const nameB = b.nombre_archivo || "";
        return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
      });
    } else {
      archivos.sort((a, b) => a.orden - b.orden);
    }

    if (archivos.length === 0) {
      return (
        <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-4 animate-fade-in shadow-2xs">
          <FileText className="w-10 h-10 text-stone-400 mx-auto opacity-50" />
          <div>
            <h5 className="font-bold text-stone-900 text-base uppercase tracking-wider font-sans">Sin archivos disponibles</h5>
            <p className="text-sm text-stone-600 leading-relaxed mt-2 font-sans">
              Esta sección todavía no tiene contenido cargado en la planilla. Los apuntes se irán subiendo a medida que avance el cuatrimestre.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3 animate-fade-in">
        {archivos.map((file, idx) => (
          <div
            key={idx}
            className="bg-white border border-stone-200/90 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-2xs hover:shadow-xs transition-all duration-200 min-h-[68px]"
          >
            <div className="flex items-center gap-4 truncate max-w-[80%]">
              <div className="w-12 h-12 rounded-xl bg-[#60290A] text-amber-50 flex flex-col items-center justify-center shrink-0 shadow-2xs font-mono">
                <FileText className="w-5 h-5 text-amber-200 mb-0.5" />
                <span className="text-[9px] font-bold tracking-widest leading-none uppercase">PDF</span>
              </div>
              <div className="space-y-0.5 truncate">
                <h5 className="font-bold text-stone-900 text-base truncate font-sans" title={file.nombre_archivo}>
                  {file.nombre_archivo}
                </h5>
                <p className="text-xs text-stone-500 font-mono uppercase tracking-wider font-semibold">
                  PUBLICADO: <span className="font-mono">{file.fecha_subida}</span>
                </p>
              </div>
            </div>
            <a
              href={file.link_drive}
              target="_blank"
              rel="noreferrer"
              className="w-11 h-11 flex items-center justify-center bg-[#60290A] hover:bg-[#471E07] text-white rounded-xl transition-all duration-200 active:scale-95 shadow-2xs cursor-pointer shrink-0"
              title="Descargar archivo"
            >
              <Download className="w-5 h-5" />
            </a>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 md:pb-6">
      
      {/* BOTÓN VOLVER AL INICIO (HOME) */}
      {onBackToHome && (
        <div className="flex items-center justify-between bg-white border border-stone-200/90 rounded-2xl px-5 py-3 shadow-2xs">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-[#1A1F35] text-stone-800 hover:text-white rounded-xl text-xs font-mono font-bold uppercase transition-all duration-150 cursor-pointer group shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-amber-800 group-hover:text-[#FCE19C] group-hover:-translate-x-1 transition-transform" />
            <span>Volver a la Página de Inicio</span>
          </button>
          <span className="text-xs font-mono text-stone-600 hidden sm:inline">
            Portal de Estudiantes
          </span>
        </div>
      )}

      {/* 1. TOP INSTITUTIONAL BANNER (CALENDARIO ACADÉMICO 2026) */}

      <div className="bg-gradient-to-r from-[#1C1510] via-[#351F12] to-[#170F0A] border border-[#3E2313]/50 rounded-2xl p-6 md:p-8 text-stone-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-2 max-w-2xl z-10">
          <div className="flex items-center gap-2">
            <span className="bg-amber-100/20 text-[#FCE19C] text-[10px] font-mono px-2.5 py-0.5 rounded-md uppercase font-bold border border-[#FCE19C]/30 tracking-wider">
              INSTITUCIONAL • UNLaR
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-wider text-white font-mono uppercase">
            CALENDARIO ACADÉMICO {CALENDARIO_ACADEMICO_CONFIG.cicloLectivo}
          </h2>
          <p className="text-xs md:text-sm text-stone-300 font-sans leading-relaxed">
            {CALENDARIO_ACADEMICO_CONFIG.descripcion}
          </p>
        </div>

        <a
          href={getCalendarioDownloadUrl()}
          target="_blank"
          rel="noreferrer"
          className="bg-white hover:bg-stone-100 text-stone-900 font-bold font-mono text-xs px-5 py-3 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer shrink-0 z-10 border border-white"
        >
          <span>DESCARGAR PDF</span>
          <Download className="w-4 h-4 text-[#60290A]" />
        </a>
      </div>

      {/* 2. ACCESO DIRECTO (SELECCIÓN DE CÁTEDRA) */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 md:p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-600 inline-block"></span>
              ACCESO DIRECTO
            </span>
            <h3 className="text-base font-bold text-stone-900 font-sans">
              Selección de Cátedra
            </h3>
          </div>

          {/* CÁTEDRA PILLS */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1 sm:pt-0">
            {catedras.map(cat => {
              const isSelected = cat.id === selectedCatedra;
              const ticker = getTickerCode(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCatedra(cat.id)}
                  className={`px-4.5 py-2 rounded-full text-xs font-mono font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 active:scale-95 ${
                    isSelected
                      ? "bg-[#1A1F35] text-white shadow-xs"
                      : "bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 shadow-2xs"
                  }`}
                >
                  <span>{ticker}</span>
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FCE19C] shadow-2xs"></span>
                  )}
                </button>
              );
            })}

            {/* SÁBANAS_EN_VIVO PILL */}
            <a
              href="https://docs.google.com/spreadsheets/u/0/"
              target="_blank"
              rel="noreferrer"
              className="px-4.5 py-2 rounded-full text-xs font-mono font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300/80 shadow-2xs transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-95"
              title="Abrir Sábanas de Calificaciones y Asistencia"
            >
              <span>SÁBANAS_EN_VIVO</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </a>
          </div>
        </div>
      </div>

      {/* 3. CORE 2-COLUMN MAIN CONTENT GRID */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* LEFT NAVIGATION SIDEBAR (DESKTOP & MOBILE RESPONSIVE) */}
        <div className="w-full lg:w-72 shrink-0 space-y-5">
          <div className="bg-[#181C2E] text-stone-100 border border-[#232942] rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[#2A314E] pb-3">
              <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-widest">
                MENÚ DE NAVEGACIÓN
              </span>
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 text-stone-300 hover:text-white rounded-lg hover:bg-white/10"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* NAV LINKS LIST */}
            <nav className="space-y-1.5">
              {navigationItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-sans font-bold transition-all duration-150 cursor-pointer text-left ${
                      isActive
                        ? "bg-[#FCE19C] text-[#181C2E] shadow-sm font-black"
                        : "text-stone-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 ${isActive ? "text-[#181C2E]" : "text-stone-400"}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* SISTEMA DE INFO BLOCK AT BOTTOM OF SIDEBAR */}
            <div className="pt-2 border-t border-[#2A314E]">
              <div className="bg-[#21273E] rounded-xl p-3.5 space-y-2 text-xs font-mono border border-[#2B3352]">
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span>SISTEMA DE INFO</span>
                </div>
                <div className="space-y-1 text-stone-300 text-[11px]">
                  <p><span className="text-stone-400">CÓDIGO:</span> <strong className="text-stone-100">{getTickerCode(currentCatedra.id)}</strong></p>
                  <p><span className="text-stone-400">MATERIA:</span> <strong className="text-stone-100">{currentCatedra.nombre}</strong></p>
                  <p><span className="text-stone-400">DICTADO:</span> <strong className="text-stone-100">1er Cuatrimestre</strong></p>
                  <p><span className="text-stone-400">PROMOCIÓN:</span> <strong className="text-stone-100">{currentYear}</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT DYNAMIC CONTENT AREA */}
        <div className="flex-1 w-full min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${selectedCatedra}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              
              {/* 1. INICIO (DASHBOARD INTRO) */}
              {activeTab === "inicio" && (
                <div className="space-y-6">
                  {/* Title Header */}
                  <div className="space-y-1 bg-white border border-stone-200/90 rounded-2xl p-6 md:p-8 shadow-2xs">
                    <span className="text-xs font-mono font-bold text-stone-500 uppercase tracking-widest">
                      COHORTE {currentYear}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight text-stone-900 font-sans uppercase">
                      {currentCatedra.nombre}
                    </h1>
                  </div>

                  {/* Academic Introduction Text */}
                  <div className="bg-white border border-stone-200/90 rounded-2xl p-6 md:p-8 shadow-2xs space-y-4">
                    <h3 className="text-sm font-mono font-bold text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-3">
                      INTRODUCCIÓN Y PROPÓSITO ACADÉMICO
                    </h3>
                    <div className="space-y-4 text-stone-800 leading-relaxed text-base font-sans text-justify">
                      {(ACADEMIC_INTRODUCTIONS[selectedCatedra] || ACADEMIC_INTRODUCTIONS.BIO_MOL).map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. DESCARGAS (RESOURCES DOWNLOAD CENTER) */}
              {activeTab === "archivos" && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="bg-white border border-stone-200/90 rounded-2xl p-6 md:p-8 shadow-2xs space-y-2">
                    <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100/80 px-3 py-1 rounded-md border border-amber-300 inline-block uppercase tracking-wider">
                      {getTickerCode(selectedCatedra)} • COHORTE {currentYear}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-stone-900 font-sans uppercase">
                      CENTRO DE DESCARGA DE RECURSOS
                    </h2>
                  </div>

                  {/* CATEGORY TABS BAR */}
                  <div className="flex flex-wrap items-center gap-2 bg-stone-100/80 p-1.5 rounded-2xl border border-stone-200">
                    {[
                      { id: "Programa", label: "Programa" },
                      { id: "Bibliografia", label: "Bibliografía" },
                      { id: "Diapositivas", label: "Diapositivas" },
                      { id: "Apuntes_Clase", label: "Apuntes de Clase" },
                      { id: "Condiciones_Cronograma", label: "Condiciones de Cursada" },
                    ].map(tab => {
                      const isActive = activeFileSubSection === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveFileSubSection(tab.id as any)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition-all duration-150 cursor-pointer ${
                            isActive
                              ? "bg-[#60290A] text-white shadow-2xs"
                              : "bg-white text-stone-700 hover:text-stone-900 border border-stone-200/80 hover:border-stone-300 shadow-2xs"
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* FILES LIST */}
                  <div>
                    {renderArchivosSection(activeFileSubSection)}
                  </div>
                </div>
              )}

              {/* 3. CRONOGRAMA */}
              {activeTab === "cronograma" && (
                <div className="space-y-6">
                  <div className="bg-white border border-stone-200/90 rounded-2xl p-6 md:p-8 shadow-2xs space-y-2">
                    <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100/80 px-3 py-1 rounded-md border border-amber-300 inline-block uppercase tracking-wider">
                      {getTickerCode(selectedCatedra)} • PLANIFICACIÓN {currentYear}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-stone-900 font-sans uppercase">
                      CRONOGRAMA DE ACTIVIDADES ACADÉMICAS
                    </h2>
                  </div>

                  {renderCronograma()}
                </div>
              )}

              {/* 4. ASISTENCIA Y NOTAS (PERFORMANCE VIEW) */}
              {activeTab === "rendimiento" && (
                <div className="space-y-6">
                  <div className="bg-white border border-stone-200/90 rounded-2xl p-6 md:p-8 shadow-2xs space-y-4">
                    <div>
                      <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100/80 px-3 py-1 rounded-md border border-amber-300 inline-block uppercase tracking-wider mb-2">
                        {getTickerCode(selectedCatedra)} • VISTA RENDIMIENTO DEL ALUMNO
                      </span>
                      <h2 className="text-2xl md:text-3xl font-black tracking-tight text-stone-900 font-sans uppercase">
                        CONSULTA DE ASISTENCIA Y NOTAS
                      </h2>
                    </div>

                    {/* SEARCH COMPONENT */}
                    <StudentSearch
                      studentNames={studentsList}
                      selectedStudent={selectedStudent}
                      onSelect={setSelectedStudent}
                      cohortYear={currentYear}
                    />
                  </div>

                  {/* LOADING STATE */}
                  {loading && (
                    <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center shadow-2xs space-y-3">
                      <Loader2 className="w-8 h-8 text-[#60290A] mx-auto animate-spin" />
                      <p className="text-xs text-stone-600 font-mono uppercase tracking-wider font-semibold">
                        Cargando información del estudiante desde Google Sheets...
                      </p>
                    </div>
                  )}

                  {/* EMPTY SEARCH PROMPT */}
                  {!loading && !selectedStudent && (
                    <div className="bg-white border border-stone-200/90 rounded-2xl p-10 text-center shadow-2xs space-y-3">
                      <User className="w-10 h-10 text-stone-400 mx-auto opacity-50" />
                      <h4 className="font-bold text-stone-900 text-lg font-sans">
                        Buscador de Alumnos
                      </h4>
                      <p className="text-sm text-stone-600 font-sans max-w-md mx-auto leading-relaxed">
                        Ingresá tu apellido en el buscador superior para consultar en tiempo real tu registro de asistencia y notas de exámenes de la asignatura.
                      </p>
                    </div>
                  )}

                  {/* STUDENT RESULT VIEW */}
                  {!loading && selectedStudent && (
                    <div className="space-y-6 animate-fade-in">
                      
                      {/* A. STUDENT HEADER CARD WITH CYAN/TEAL GRADIENT */}
                      <div className="bg-gradient-to-r from-[#BFE6EC] via-[#CDEFE7] to-[#B3E5D8] border border-teal-300/60 rounded-2xl p-6 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-white/90 text-teal-950 font-black text-2xl font-mono flex items-center justify-center shadow-2xs border border-white shrink-0">
                            {selectedStudent.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-bold text-teal-900 uppercase tracking-widest">
                              ESTUDIANTE SELECCIONADO
                            </span>
                            <h3 className="text-xl md:text-2xl font-black text-stone-900 uppercase font-sans tracking-tight">
                              {selectedStudent}
                            </h3>
                          </div>
                        </div>

                        {/* STATUS BADGE */}
                        <div>
                          {(() => {
                            let cond: string | undefined;
                            if (selectedCatedra === "TECNO_3") {
                              cond = studentGradesStatus?.condicion_final;
                            } else {
                              cond = studentGradesNum?.condicion_final;
                            }
                            const hasCond = cond && cond.trim() !== "" && cond !== "-";
                            return (
                              <span className={`px-4.5 py-1.5 rounded-full font-extrabold text-xs font-mono uppercase tracking-widest shadow-2xs border ${
                                hasCond 
                                  ? "bg-emerald-700 text-white border-emerald-800" 
                                  : "bg-stone-200 text-stone-600 border-stone-300"
                              }`}>
                                {hasCond ? cond : "SIN REGISTRO"}
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                      {/* B. ASISTENCIA BLOCK WITH CIRCULAR RING GAUGE */}
                      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 md:p-8 shadow-2xs space-y-4">
                        <h4 className="text-xs font-mono font-bold text-stone-600 uppercase tracking-widest">
                          ASISTENCIA
                        </h4>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-2">
                          {(() => {
                            const totalClases = currentCatedra?.total_clases ?? 10;
                            const presentes = studentAttendance ? studentAttendance.presentes : 0;
                            const pct = Math.round((presentes / totalClases) * 100);
                            const req = selectedCatedra === "BIO_MOL" ? 80 : 75;
                            const cumple = pct >= req;

                            // SVG CIRCLE GAUGE CALCULATIONS
                            const radius = 45;
                            const strokeWidth = 9;
                            const circumference = 2 * Math.PI * radius;
                            const strokeDashoffset = circumference - (pct / 100) * circumference;

                            return (
                              <>
                                {/* CIRCULAR RING GAUGE */}
                                <div className="flex items-center gap-6">
                                  <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 110 110">
                                      {/* Background Track */}
                                      <circle
                                        cx="55"
                                        cy="55"
                                        r={radius}
                                        className="stroke-stone-100"
                                        strokeWidth={strokeWidth}
                                        fill="transparent"
                                      />
                                      {/* Progress Stroke */}
                                      <circle
                                        cx="55"
                                        cy="55"
                                        r={radius}
                                        className={cumple ? "stroke-cyan-500" : "stroke-rose-500"}
                                        strokeWidth={strokeWidth}
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        fill="transparent"
                                        style={{ transition: "stroke-dashoffset 0.5s ease" }}
                                      />
                                    </svg>
                                    <span className="absolute font-black font-mono text-2xl text-stone-900">
                                      {pct}%
                                    </span>
                                  </div>

                                  <div className="space-y-1">
                                    <h5 className="font-bold text-stone-900 text-base font-sans">
                                      Clases Prácticas Requeridas
                                    </h5>
                                    <p className="text-sm text-stone-600 font-mono font-medium">
                                      {presentes} de {totalClases} clases
                                    </p>
                                  </div>
                                </div>

                                {/* STATUS BADGE */}
                                <div>
                                  <span className={`px-4.5 py-2 rounded-full font-bold text-xs font-mono uppercase tracking-wider shadow-2xs ${
                                    cumple 
                                      ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                      : "bg-stone-200 text-stone-700 border border-stone-300"
                                  }`}>
                                    {cumple ? "SUFICIENTE" : "INSUFICIENTE"}
                                  </span>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* C. NOTAS BLOCK */}
                      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 md:p-8 shadow-2xs space-y-4">
                        <h4 className="text-xs font-mono font-bold text-stone-600 uppercase tracking-widest">
                          NOTAS
                        </h4>

                        {/* NUMERICAL SCHEMA (BIO_MOL / TECNO II) */}
                        {selectedCatedra !== "TECNO_3" ? (
                          studentGradesNum ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              
                              {/* 1er Parcial Card */}
                              <div className="rounded-2xl overflow-hidden shadow-2xs border border-stone-200 flex flex-col justify-between bg-white">
                                <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 text-white px-4 py-3 flex justify-between items-center">
                                  <span className="font-bold text-xs uppercase font-mono tracking-wider">1er PARCIAL</span>
                                  <span className="bg-white/90 text-emerald-950 px-2.5 py-0.5 rounded-full text-xs font-extrabold font-mono uppercase">
                                    {studentGradesNum.p1_resultado || "-"}
                                  </span>
                                </div>
                                <div className="p-6 text-center space-y-2">
                                  <div className="text-4xl md:text-5xl font-black font-mono text-stone-900">
                                    {studentGradesNum.p1_teoria && studentGradesNum.p1_teoria !== "-" 
                                      ? studentGradesNum.p1_teoria 
                                      : (studentGradesNum.p1_practica && studentGradesNum.p1_practica !== "-" 
                                          ? studentGradesNum.p1_practica 
                                          : "-")}
                                  </div>
                                  <p className="text-xs font-mono text-stone-500 font-bold uppercase tracking-wider">
                                    TEO: {studentGradesNum.p1_teoria || "-"} | PRAC: {studentGradesNum.p1_practica || "-"}
                                  </p>
                                </div>
                              </div>

                              {/* 2do Parcial Card */}
                              <div className="rounded-2xl overflow-hidden shadow-2xs border border-stone-200 flex flex-col justify-between bg-white">
                                <div className="bg-gradient-to-r from-sky-500 to-blue-500 text-white px-4 py-3 flex justify-between items-center">
                                  <span className="font-bold text-xs uppercase font-mono tracking-wider">2do PARCIAL</span>
                                  <span className="bg-white/90 text-sky-950 px-2.5 py-0.5 rounded-full text-xs font-extrabold font-mono uppercase">
                                    {studentGradesNum.p2_resultado || "-"}
                                  </span>
                                </div>
                                <div className="p-6 text-center space-y-2">
                                  <div className="text-4xl md:text-5xl font-black font-mono text-stone-900">
                                    {studentGradesNum.p2_teoria && studentGradesNum.p2_teoria !== "-" 
                                      ? studentGradesNum.p2_teoria 
                                      : (studentGradesNum.p2_practica && studentGradesNum.p2_practica !== "-" 
                                          ? studentGradesNum.p2_practica 
                                          : "-")}
                                  </div>
                                  <p className="text-xs font-mono text-stone-500 font-bold uppercase tracking-wider">
                                    TEO: {studentGradesNum.p2_teoria || "-"} | PRAC: {studentGradesNum.p2_practica || "-"}
                                  </p>
                                </div>
                              </div>

                              {/* Recuperatorio Card */}
                              <div className="rounded-2xl overflow-hidden shadow-2xs border border-stone-200 flex flex-col justify-between bg-white">
                                <div className="bg-stone-100 text-stone-700 px-4 py-3 flex justify-between items-center border-b border-stone-200">
                                  <span className="font-bold text-xs uppercase font-mono tracking-wider">RECUPERATORIO</span>
                                  <span className="bg-stone-200 text-stone-700 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono uppercase">
                                    {studentGradesNum.recupera || "-"}
                                  </span>
                                </div>
                                <div className="p-6 text-center space-y-2">
                                  <div className="text-4xl md:text-5xl font-black font-mono text-stone-900">
                                    {studentGradesNum.rec_teoria && studentGradesNum.rec_teoria !== "-" 
                                      ? studentGradesNum.rec_teoria 
                                      : (studentGradesNum.rec_practica && studentGradesNum.rec_practica !== "-" 
                                          ? studentGradesNum.rec_practica 
                                          : "-")}
                                  </div>
                                  <p className="text-xs font-mono text-stone-400 font-bold uppercase tracking-wider">
                                    TEO: {studentGradesNum.rec_teoria || "-"} | PRAC: {studentGradesNum.rec_practica || "-"}
                                  </p>
                                </div>
                              </div>

                            </div>
                          ) : (
                            <p className="text-sm text-stone-500 italic text-center font-sans py-4">
                              No se registraron notas para este alumno.
                            </p>
                          )
                        ) : (
                          /* QUALITATIVE SCHEMA (TECNO III) */
                          studentGradesStatus ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="rounded-2xl overflow-hidden shadow-2xs border border-stone-200 flex flex-col justify-between bg-white">
                                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 text-white px-4 py-3 flex justify-between items-center">
                                    <span className="font-bold text-xs uppercase font-mono tracking-wider">1ER PARCIAL TEO</span>
                                    <span className="bg-white/90 text-emerald-950 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono uppercase">
                                      {studentGradesStatus.p1_condicion || "-"}
                                    </span>
                                  </div>
                                  <div className="p-6 text-center">
                                    <span className="text-2xl font-black font-mono text-stone-900">{studentGradesStatus.p1_teoria || "-"}</span>
                                  </div>
                                </div>

                                <div className="rounded-2xl overflow-hidden shadow-2xs border border-stone-200 flex flex-col justify-between bg-white">
                                  <div className="bg-gradient-to-r from-sky-500 to-blue-500 text-white px-4 py-3 flex justify-between items-center">
                                    <span className="font-bold text-xs uppercase font-mono tracking-wider">2DO PARCIAL TEO</span>
                                    <span className="bg-white/90 text-sky-950 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono uppercase">
                                      {studentGradesStatus.p2_condicion || "-"}
                                    </span>
                                  </div>
                                  <div className="p-6 text-center">
                                    <span className="text-2xl font-black font-mono text-stone-900">{studentGradesStatus.p2_teoria || "-"}</span>
                                  </div>
                                </div>

                                <div className="rounded-2xl overflow-hidden shadow-2xs border border-stone-200 flex flex-col justify-between bg-white">
                                  <div className="bg-stone-100 text-stone-700 px-4 py-3 flex justify-between items-center border-b border-stone-200">
                                    <span className="font-bold text-xs uppercase font-mono tracking-wider">RECUPERATORIOS</span>
                                    <span className="bg-stone-200 text-stone-700 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono uppercase">
                                      {studentGradesStatus.rec_condicion || "-"}
                                    </span>
                                  </div>
                                  <div className="p-6 text-center">
                                    <span className="text-2xl font-black font-mono text-stone-400">{studentGradesStatus.rec_teoria || "-"}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="p-5 bg-stone-50 border border-stone-200/90 rounded-2xl flex justify-between items-center">
                                <div>
                                  <p className="text-xs font-mono text-stone-600 uppercase tracking-wider font-bold">RENDIMIENTO PRÁCTICO</p>
                                  <h5 className="font-bold text-stone-900 text-base font-sans">Proyecto Global Troncal</h5>
                                </div>
                                <span className="px-4 py-1.5 rounded-full text-xs font-mono font-extrabold border bg-emerald-100 text-emerald-950 border-emerald-300">
                                  {studentGradesStatus.practica || "-"}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-stone-500 italic text-center font-sans py-4">
                              No se registraron notas para este alumno.
                            </p>
                          )
                        )}
                      </div>

                    </div>
                  )}
                </div>
              )}

              {/* 5. COMUNICACIÓN (REMIND WIDGET) */}
              {activeTab === "comunicacion" && <RemindWidget />}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* FOOTER COPYRIGHT */}
      <footer className="pt-8 pb-4 text-center text-xs font-mono text-stone-500 space-y-1">
        <p>Copyright © 2026 - TERMINAL ACADÉMICA v2.1.0. Todos los derechos reservados.</p>
        <p className="text-[10px] text-stone-400">UNLaR • Universidad Nacional de La Rioja</p>
      </footer>
    </div>
  );
}
