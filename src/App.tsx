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
  AlertTriangle
} from "lucide-react";

// Import core data
import { markdownText } from "./data/mockData";

// Import modularized components
import VisualizerTab from "./components/VisualizerTab";
import RecommendationTab from "./components/RecommendationTab";
import VersioningTab from "./components/VersioningTab";
import MarkdownTab from "./components/MarkdownTab";
import PortalView from "./components/portal/PortalView";

/**
 * Orquestador principal de la aplicación.
 * Administra la vista principal (Portal Estudiantil o Diagnóstico Docente) y
 * maneja el estado de la pestaña activa en el modo de especificaciones.
 */
export default function App() {
  const [viewMode, setViewMode] = useState<"estudiante" | "docente">("estudiante");
  const [activeTab, setActiveTab] = useState<"visualizer" | "recommendation" | "versioning" | "markdown">("visualizer");
  const [copied, setCopied] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    const correctPassword = import.meta.env.VITE_DOCENTE_PASSWORD;
    if (!correctPassword || correctPassword.trim() === "" || correctPassword.startsWith("TU_CLAVE")) {
      setPasswordError("Contraseña no configurada, contactá al administrador.");
      return;
    }
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
        ? "bg-[#0A0E17] text-[#EDEFF3] selection:bg-emerald-500/20 selection:text-[#16C784]" 
        : "bg-[#FAF9F6] text-stone-800 selection:bg-amber-200 selection:text-amber-900"
    }`}>
      {/* HEADER SECTION */}
      <header className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        isStudent 
          ? "bg-[#0F1420]/90 backdrop-blur-md border-[#1E2531] shadow-md shadow-black/10" 
          : "border-stone-200 bg-white shadow-xs"
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg shadow-sm transition-colors duration-300 ${
              isStudent ? "bg-emerald-500/10 text-[#16C784]" : "bg-stone-900 text-white"
            }`}>
              <Database className="w-6 h-6" id="logo-icon" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] tracking-widest uppercase font-mono px-2 py-0.5 rounded-sm font-bold transition-colors duration-300 ${
                  isStudent ? "bg-emerald-500/10 text-[#16C784]" : "bg-amber-100 text-amber-800"
                }`}>
                  {isStudent ? "Terminal Académica" : "Portal de Cátedras"}
                </span>
                <span className="text-xs text-[#5B6577] font-mono">v2.1.0</span>
              </div>
              <h1 className={`text-lg font-bold tracking-tight transition-colors duration-300 ${
                isStudent ? "text-white" : "text-stone-900"
              }`} id="app-title">
                {isStudent ? "Prof. Sergio Rearte" : "Portal Universitario Interactiva & Arquitectura"}
              </h1>
            </div>
          </div>

          {/* VIEW MODE SELECTOR */}
          <div className={`flex items-center gap-1.5 p-1.5 rounded-xl self-stretch md:self-auto border transition-colors duration-300 ${
            isStudent 
              ? "bg-[#131826] border-[#1E2531]" 
              : "bg-stone-100 border-stone-200/55 shadow-xs"
          }`}>
            <button
              onClick={() => setViewMode("estudiante")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                isStudent
                  ? "bg-[#1E2531] text-white font-bold"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <GraduationCap className={`w-4 h-4 ${isStudent ? "text-[#16C784]" : "text-amber-600"}`} />
              <span>Vista Estudiante</span>
            </button>
            <button
              onClick={() => setViewMode("docente")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                !isStudent
                  ? "bg-white text-stone-950 shadow-sm font-bold"
                  : "text-[#5B6577] hover:text-[#EDEFF3]"
              }`}
            >
              <Wrench className={`w-4 h-4 ${!isStudent ? "text-amber-600" : "text-stone-400"}`} />
              <span>Especificación Docente</span>
            </button>
          </div>
        </div>
      </header>

      {/* CORE INFO SUMMARY - ONLY SHOW IN TEACHER MODE TO AVOID CLUTTERING STUDENT VIEW */}
      {!isStudent && isAuthenticated && (
        <section className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-stone-100 py-10 px-6 shadow-md animate-fade-in">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 text-amber-400 text-sm font-mono mb-2">
                  <Clock className="w-4 h-4" />
                  <span>Ciclo Lectivo Activo: Cohorte 2026</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-white mb-3">
                  Reemplazo de Google Sites con Google Sheets + React
                </h2>
                <p className="text-stone-300 leading-relaxed text-sm md:text-base">
                  Diseño de datos estructurado y sin sobreingeniería. Permite al docente actualizar programas, apuntes, asistencias y notas desde una planilla tradicional de cálculo, alimentando en tiempo real una web interactiva y responsiva de alta gama en Google AI Studio.
                </p>
              </div>
              <div className="bg-stone-800/80 backdrop-blur-xs p-5 rounded-xl border border-stone-700 w-full lg:w-96 text-xs font-mono space-y-2.5">
                <div className="text-amber-400 font-semibold border-b border-stone-700 pb-1.5 flex items-center justify-between">
                  <span>ESTADO DEL RELEVAMIENTO</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Cátedras:</span>
                  <span className="text-stone-200">3 Cuatrimestrales</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Secciones por Cátedra:</span>
                  <span className="text-stone-200">8 Estándar</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Planillas de Notas:</span>
                  <span className="text-emerald-400 font-semibold">2 Esquemas (Num / Status)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Gestor de Históricos:</span>
                  <span className="text-stone-200">Soportado por Año</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CORE WRAPPER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {isStudent ? (
          /* PORTAL DE ESTUDIANTES FINAL */
          <div className="space-y-6">
            <PortalView />
          </div>
        ) : !isAuthenticated ? (
          /* PANTALLA DE CONTRASEÑA DOCENTE PROTEGIDA */
          <div className="max-w-md mx-auto my-12 p-8 bg-white border border-stone-200 rounded-2xl shadow-xl space-y-6 animate-fade-in text-stone-800">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold tracking-tight text-stone-900 font-sans">Acceso Docente Protegido</h3>
              <p className="text-xs text-stone-500 leading-relaxed font-sans">
                Para ingresar a las especificaciones técnicas y panel de diagnóstico, introduce la contraseña de la cátedra.
              </p>
            </div>

            {(!import.meta.env.VITE_DOCENTE_PASSWORD || import.meta.env.VITE_DOCENTE_PASSWORD.trim() === "" || import.meta.env.VITE_DOCENTE_PASSWORD.startsWith("TU_CLAVE")) ? (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-600 font-sans animate-fade-in">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Acceso Denegado</p>
                    <p className="leading-relaxed font-medium">Contraseña no configurada, contactá al administrador.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode("estudiante");
                    setPasswordInput("");
                    setPasswordError(null);
                  }}
                  className="w-full py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl text-xs font-semibold font-mono tracking-wider uppercase transition-all duration-150 active:scale-98 cursor-pointer text-center"
                >
                  Volver al Portal Estudiantil
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-bold">Contraseña Docente</label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Introduce la contraseña..."
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-stone-900 placeholder-stone-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-mono"
                    autoFocus
                  />
                </div>

                {passwordError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-600 animate-fade-in">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                    <span className="font-sans font-medium">{passwordError}</span>
                  </div>
                )}

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all duration-150 active:scale-98 cursor-pointer shadow-sm text-center"
                  >
                    Confirmar Clave
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("estudiante");
                      setPasswordInput("");
                      setPasswordError(null);
                    }}
                    className="w-full py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl text-xs font-semibold font-mono tracking-wider uppercase transition-all duration-150 active:scale-98 cursor-pointer text-center"
                  >
                    Volver al Portal Estudiantil
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* TAB DE ESPECIFICACIONES Y DIAGNÓSTICO DOCENTE */
          <div className="space-y-6 animate-fade-in">
            {/* NAVIGATION TABS */}
            <div className="flex border-b border-stone-200 mb-8 overflow-x-auto gap-2">
              <button
                id="tab-visualizer"
                onClick={() => setActiveTab("visualizer")}
                className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === "visualizer"
                    ? "border-amber-600 text-amber-900 bg-amber-50/50"
                    : "border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300"
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>1. Visualizador de Hojas de Datos</span>
              </button>
              <button
                id="tab-recommendation"
                onClick={() => setActiveTab("recommendation")}
                className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === "recommendation"
                    ? "border-amber-600 text-amber-900 bg-amber-50/50"
                    : "border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>2. Recomendación: Sheets vs JSON</span>
              </button>
              <button
                id="tab-versioning"
                onClick={() => setActiveTab("versioning")}
                className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === "versioning"
                    ? "border-amber-600 text-amber-900 bg-amber-50/50"
                    : "border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300"
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>3. Gestión de Históricos (Años)</span>
              </button>
              <button
                id="tab-markdown"
                onClick={() => setActiveTab("markdown")}
                className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === "markdown"
                    ? "border-amber-600 text-amber-900 bg-amber-50/50"
                    : "border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>4. Especificación Markdown Completa</span>
              </button>

              <div className="ml-auto shrink-0 pb-2 hidden lg:block">
                <button
                  id="btn-copy-header"
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-lg font-medium text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Markdown</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* TAB CONTENTS */}
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
      <footer className={`border-t py-12 mt-16 text-center text-xs font-mono transition-colors duration-300 ${
        isStudent 
          ? "bg-[#0F1420] border-[#1E2531] text-[#5B6577]" 
          : "bg-stone-100 border-stone-200 text-stone-500"
      }`}>
        <div className="max-w-7xl mx-auto px-6 space-y-2">
          <p className={isStudent ? "text-[#EDEFF3]/80" : ""}>Portal Universitario de Cátedras &amp; Arquitectura de Datos Académicas</p>
          <p className={isStudent ? "text-[#5B6577]" : "text-stone-400"}>Sincronizado dinámicamente mediante Google Sheets API en Google AI Studio</p>
        </div>
      </footer>
    </div>
  );
}
