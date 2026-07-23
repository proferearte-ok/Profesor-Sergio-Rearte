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
      <header className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        isStudent 
          ? "bg-white/95 backdrop-blur-md border-amber-900/10 shadow-2xs" 
          : "border-stone-200 bg-white shadow-2xs"
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-xl shadow-xs transition-colors duration-300 ${
              isStudent ? "bg-amber-900 text-amber-50 shadow-amber-900/20" : "bg-stone-900 text-white"
            }`}>
              <Database className="w-5.5 h-5.5" id="logo-icon" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs tracking-widest uppercase font-mono px-2.5 py-0.5 rounded-md font-bold transition-colors duration-300 ${
                  isStudent ? "bg-amber-100/80 text-amber-950 border border-amber-200/80" : "bg-amber-100 text-amber-900 border border-amber-200"
                }`}>
                  {isStudent ? "Terminal Académica" : "Portal de Cátedras"}
                </span>
                <span className="text-xs text-stone-500 font-mono font-medium">v2.1.0</span>
              </div>
              <h1 className={`text-lg md:text-xl font-bold tracking-tight transition-colors duration-300 ${
                isStudent ? "text-stone-900" : "text-stone-900"
              }`} id="app-title">
                {isStudent ? "Prof. Sergio Rearte" : "Portal Universitario Interactivo & Arquitectura"}
              </h1>
            </div>
          </div>

          {/* VIEW MODE SELECTOR */}
          <div className={`flex items-center gap-2 p-1.5 rounded-xl self-stretch md:self-auto border transition-colors duration-300 ${
            isStudent 
              ? "bg-stone-100/90 border-stone-200/90" 
              : "bg-stone-100 border-stone-200 shadow-2xs"
          }`}>
            <button
              onClick={() => setViewMode("estudiante")}
              className={`flex items-center gap-2 px-4.5 py-2.5 rounded-lg text-sm font-bold cursor-pointer transition-all ${
                isStudent
                  ? "bg-amber-900 text-white shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <GraduationCap className={`w-4.5 h-4.5 ${isStudent ? "text-amber-200" : "text-amber-700"}`} />
              <span>Vista Estudiante</span>
            </button>
            <button
              onClick={() => setViewMode("docente")}
              className={`flex items-center gap-2 px-4.5 py-2.5 rounded-lg text-sm font-bold cursor-pointer transition-all ${
                !isStudent
                  ? "bg-amber-900 text-white shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Wrench className={`w-4.5 h-4.5 ${!isStudent ? "text-amber-200" : "text-stone-500"}`} />
              <span>Panel Docente</span>
            </button>
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
                  <span className="text-stone-400">Gestor de Históricos:</span>
                  <span className="text-stone-100 font-semibold">Soportado por Año</span>
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
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto border border-amber-200 shadow-2xs">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-stone-900 font-sans">Acceso Panel Docente</h3>
              <p className="text-sm text-stone-600 leading-relaxed font-sans">
                Para ingresar a las especificaciones técnicas y panel de diagnóstico, introduce la contraseña del Panel Docente.
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
                      setPasswordInput("");
                      setPasswordError(null);
                    }}
                    className="w-full py-3.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold font-mono tracking-wider uppercase transition-all duration-150 active:scale-98 cursor-pointer text-center"
                  >
                    Volver al Portal Estudiantil
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
