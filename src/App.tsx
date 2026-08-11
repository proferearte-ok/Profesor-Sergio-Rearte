/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { 
  Database, 
  FileSpreadsheet, 
  Calendar, 
  Copy, 
  Check, 
  Layers, 
  FileText,
  Clock,
  Sparkles,
  GraduationCap,
  Wrench,
  Lock,
  AlertTriangle,
  Megaphone,
  Home as HomeIcon,
  BookOpen
} from "lucide-react";

// Import core data
import { markdownText } from "./data/mockData";

// Import modularized components
import VisualizerTab from "./components/VisualizerTab";
import RecommendationTab from "./components/RecommendationTab";
import VersioningTab from "./components/VersioningTab";
import MarkdownTab from "./components/MarkdownTab";
import PortalView from "./components/portal/PortalView";
import HomePage from "./components/home/HomePage";
import AnunciosFormTab from "./components/admin/AnunciosFormTab";

/**
 * Orquestador principal de la aplicación.
 * Administra la vista principal (HomePage, Portal Estudiantil o Diagnóstico Docente) y
 * maneja el estado de la pestaña activa en el modo de especificaciones.
 */
export default function App() {
  const [viewMode, setViewMode] = useState<"estudiante" | "docente">("estudiante");
  const [studentSubView, setStudentSubView] = useState<"home" | "portal">("home");
  const [selectedCatedraForPortal, setSelectedCatedraForPortal] = useState<string | undefined>(undefined);

  const [activeTab, setActiveTab] = useState<"visualizer" | "recommendation" | "versioning" | "markdown" | "anuncios">("visualizer");
  const [copied, setCopied] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    const envPassword = import.meta.env.VITE_DOCENTE_PASSWORD;
    const correctPassword = (envPassword && envPassword.trim() !== "" && !envPassword.startsWith("TU_CLAVE"))
      ? envPassword.trim()
      : "nadp3638";

    if (passwordInput === correctPassword) {
      setIsAuthenticated(true);
      setPasswordError(null);
    } else {
      setPasswordError("Clave incorrecta. Por favor intenta de nuevo.");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdownText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isStudent = viewMode === "estudiante";

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      isStudent 
        ? "bg-[#FAF7F2] text-stone-900 selection:bg-amber-200 selection:text-amber-950" 
        : "bg-[#FAF7F2] text-stone-900 selection:bg-amber-200 selection:text-amber-950"
    }`}>
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-50 border-b border-stone-200/90 bg-white/95 backdrop-blur-md shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setViewMode("estudiante"); setStudentSubView("home"); }}
              className="p-2.5 rounded-xl bg-[#1A1F35] text-[#FCE19C] shadow-2xs hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center"
              title="Ir a Inicio"
            >
              <Database className="w-5 h-5" id="logo-icon" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-stone-900 uppercase tracking-wider">
                  {isStudent ? (studentSubView === "home" ? "INICIO & NOVEDADES" : "PORTAL ACADÉMICO") : "PANEL DOCENTE"}
                </span>
                <span className="text-[10px] text-stone-500 font-mono font-bold">v2.2.0</span>
              </div>
              <h1 className="text-sm md:text-base font-bold text-stone-900 font-sans tracking-tight" id="app-title">
                {isStudent ? "Profesor Sergio Rearte" : "Portal Universitario Interactivo & Arquitectura"}
              </h1>
            </div>
          </div>

          {/* ESTUDIANTE SUB-NAVEGACIÓN O SELECCIÓN DE MODO */}
          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
            {isStudent && (
              <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-100 border border-stone-200 shadow-2xs">
                <button
                  onClick={() => setStudentSubView("home")}
                  className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono uppercase transition-all cursor-pointer ${
                    studentSubView === "home"
                      ? "bg-amber-900 text-white shadow-2xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <HomeIcon className="w-3.5 h-3.5" />
                  <span>Inicio</span>
                </button>
                <button
                  onClick={() => setStudentSubView("portal")}
                  className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono uppercase transition-all cursor-pointer ${
                    studentSubView === "portal"
                      ? "bg-amber-900 text-white shadow-2xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Portal Cátedras</span>
                </button>
              </div>
            )}

            {/* VIEW MODE SELECTOR */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 border border-stone-200 shadow-2xs">
              <button
                onClick={() => setViewMode("estudiante")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono uppercase transition-all cursor-pointer ${
                  isStudent
                    ? "bg-[#1A1F35] text-white shadow-2xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <GraduationCap className={`w-4 h-4 ${isStudent ? "text-[#FCE19C]" : "text-stone-500"}`} />
                <span>Estudiante</span>
              </button>
              <button
                onClick={() => setViewMode("docente")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono uppercase transition-all cursor-pointer ${
                  !isStudent
                    ? "bg-[#1A1F35] text-white shadow-2xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Wrench className={`w-4 h-4 ${!isStudent ? "text-[#FCE19C]" : "text-stone-500"}`} />
                <span>Docente</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CORE INFO SUMMARY - ONLY SHOW IN TEACHER MODE TO AVOID CLUTTERING STUDENT VIEW */}
      {!isStudent && isAuthenticated && (
        <section className="bg-gradient-to-r from-stone-950 via-amber-950 to-stone-950 text-stone-100 py-10 px-6 shadow-md animate-fade-in">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 text-amber-300 text-base font-mono mb-2">
                  <Clock className="w-4.5 h-4.5 text-amber-400" />
                  <span className="font-semibold">Ciclo Lectivo Activo: Cohorte 2026</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
                  Reemplazo de Google Sites con Google Sheets + React
                </h2>
                <p className="text-stone-200 leading-relaxed text-base md:text-lg">
                  Diseño de datos estructurado y sin sobreingeniería. Permite al docente actualizar programas, apuntes, asistencias y notas desde una planilla tradicional de cálculo, alimentando en tiempo real una web interactiva y responsiva de alta gama en Google AI Studio.
                </p>
              </div>
              <div className="bg-amber-950/60 backdrop-blur-xs p-5 rounded-2xl border border-amber-800/40 w-full lg:w-96 text-sm font-mono space-y-3">
                <div className="text-amber-300 font-bold border-b border-amber-800/50 pb-2 flex items-center justify-between">
                  <span>ESTADO DEL RELEVAMIENTO</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Cátedras:</span>
                  <span className="text-stone-100 font-semibold">3 Cuatrimestrales</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Secciones por Cátedra:</span>
                  <span className="text-stone-100 font-semibold">8 Estándar</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Planillas de Notas:</span>
                  <span className="text-emerald-400 font-bold">2 Esquemas (Num / Status)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Publicación de Anuncios:</span>
                  <span className="text-amber-300 font-bold">Google Apps Script Web App</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CORE WRAPPER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {isStudent ? (
          /* VISTA ESTUDIANTE: INICIO (HOME) O PORTAL DE CÁTEDRAS */
          studentSubView === "home" ? (
            <HomePage 
              onNavigateToPortal={(catId) => {
                if (catId) {
                  setSelectedCatedraForPortal(catId);
                }
                setStudentSubView("portal");
              }} 
            />
          ) : (
            <div className="space-y-6">
              <PortalView 
                onBackToHome={() => setStudentSubView("home")} 
                initialCatedraId={selectedCatedraForPortal}
              />
            </div>
          )
        ) : !isAuthenticated ? (
          /* PANTALLA DE CONTRASEÑA DOCENTE PROTEGIDA */
          <div className="max-w-md mx-auto my-12 p-8 bg-white border border-stone-200 rounded-2xl shadow-xl space-y-6 animate-fade-in text-stone-800">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto border border-amber-200 shadow-2xs">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-stone-900 font-sans">Acceso Panel Docente</h3>
              <p className="text-sm text-stone-600 leading-relaxed font-sans">
                Para ingresar a las especificaciones técnicas, carga de anuncios y panel de diagnóstico, introduce la contraseña del Panel Docente.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-amber-900 block font-bold">Contraseña Docente</label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Introduce la contraseña..."
                    className="w-full px-4.5 py-3.5 rounded-xl border border-stone-300 text-stone-900 placeholder-stone-400 text-base focus:outline-hidden focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all font-mono"
                    autoFocus
                  />
                </div>

                {passwordError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-sm text-rose-700 animate-fade-in">
                    <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-rose-600" />
                    <span className="font-sans font-medium">{passwordError}</span>
                  </div>
                )}

                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all duration-150 active:scale-98 cursor-pointer shadow-sm text-center"
                  >
                    Confirmar Clave
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("estudiante");
                      setStudentSubView("home");
                      setPasswordInput("");
                      setPasswordError(null);
                    }}
                    className="w-full py-3.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold font-mono tracking-wider uppercase transition-all duration-150 active:scale-98 cursor-pointer text-center"
                  >
                    Volver a la Página de Inicio
                  </button>
                </div>
              </form>
            </div>
        ) : (
          /* TAB DE ESPECIFICACIONES Y DIAGNÓSTICO DOCENTE */
          <div className="space-y-6 animate-fade-in">
            {/* NAVIGATION TABS */}
            <div className="flex border-b border-stone-200 mb-8 overflow-x-auto gap-2">
              <button
                id="tab-anuncios"
                onClick={() => setActiveTab("anuncios")}
                className={`flex items-center gap-2 px-5 py-3.5 border-b-2 font-bold text-base whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === "anuncios"
                    ? "border-amber-800 text-amber-950 bg-amber-100/50"
                    : "border-transparent text-stone-500 hover:text-stone-900 hover:border-stone-300"
                }`}
              >
                <Megaphone className="w-4.5 h-4.5" />
                <span>5. Cargar Anuncios / Novedades</span>
              </button>
              <button
                id="tab-visualizer"
                onClick={() => setActiveTab("visualizer")}
                className={`flex items-center gap-2 px-5 py-3.5 border-b-2 font-bold text-base whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === "visualizer"
                    ? "border-amber-800 text-amber-950 bg-amber-100/50"
                    : "border-transparent text-stone-500 hover:text-stone-900 hover:border-stone-300"
                }`}
              >
                <FileSpreadsheet className="w-4.5 h-4.5" />
                <span>1. Visualizador de Hojas de Datos</span>
              </button>
              <button
                id="tab-recommendation"
                onClick={() => setActiveTab("recommendation")}
                className={`flex items-center gap-2 px-5 py-3.5 border-b-2 font-bold text-base whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === "recommendation"
                    ? "border-amber-800 text-amber-950 bg-amber-100/50"
                    : "border-transparent text-stone-500 hover:text-stone-900 hover:border-stone-300"
                }`}
              >
                <Layers className="w-4.5 h-4.5" />
                <span>2. Recomendación: Sheets vs JSON</span>
              </button>
              <button
                id="tab-versioning"
                onClick={() => setActiveTab("versioning")}
                className={`flex items-center gap-2 px-5 py-3.5 border-b-2 font-bold text-base whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === "versioning"
                    ? "border-amber-800 text-amber-950 bg-amber-100/50"
                    : "border-transparent text-stone-500 hover:text-stone-900 hover:border-stone-300"
                }`}
              >
                <Calendar className="w-4.5 h-4.5" />
                <span>3. Gestión de Históricos (Años)</span>
              </button>
              <button
                id="tab-markdown"
                onClick={() => setActiveTab("markdown")}
                className={`flex items-center gap-2 px-5 py-3.5 border-b-2 font-bold text-base whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === "markdown"
                    ? "border-amber-800 text-amber-950 bg-amber-100/50"
                    : "border-transparent text-stone-500 hover:text-stone-900 hover:border-stone-300"
                }`}
              >
                <FileText className="w-4.5 h-4.5" />
                <span>4. Especificación Markdown Completa</span>
              </button>

              <div className="ml-auto shrink-0 pb-2 hidden lg:block">
                <button
                  id="btn-copy-header"
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 bg-amber-900 hover:bg-amber-950 text-white px-4.5 py-2.5 rounded-xl font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-2xs active:scale-95 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Markdown</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* TAB CONTENTS */}
            {activeTab === "anuncios" && <AnunciosFormTab />}
            {activeTab === "visualizer" && <VisualizerTab />}
            {activeTab === "recommendation" && <RecommendationTab />}
            {activeTab === "versioning" && <VersioningTab />}
            {activeTab === "markdown" && (
              <MarkdownTab copied={copied} copyToClipboard={copyToClipboard} />
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className={`border-t py-10 mt-16 text-center text-sm font-mono transition-colors duration-300 ${
        isStudent 
          ? "bg-white border-stone-200 text-stone-600 shadow-2xs" 
          : "bg-white border-stone-200 text-stone-600 shadow-2xs"
      }`}>
        <div className="max-w-7xl mx-auto px-6 space-y-2">
          <p className="text-stone-800 font-bold">Portal Universitario de Cátedras &amp; Arquitectura de Datos Académicas</p>
          <p className="text-stone-500 text-xs">Sincronizado dinámicamente mediante Google Sheets API en Google AI Studio</p>
        </div>
      </footer>
    </div>
  );
}

