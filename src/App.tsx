/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  Database, 
  FileSpreadsheet, 
  Calendar, 
  Copy, 
  Check, 
  Layers, 
  FileText,
  Clock,
  Sparkles
} from "lucide-react";

// Import core data
import { markdownText } from "./data/mockData";

// Import modularized components
import VisualizerTab from "./components/VisualizerTab";
import RecommendationTab from "./components/RecommendationTab";
import VersioningTab from "./components/VersioningTab";
import MarkdownTab from "./components/MarkdownTab";

/**
 * Orquestador principal de la aplicación.
 * Administra el estado de la pestaña activa y renderiza el componente correspondiente,
 * manteniendo un diseño visual idéntico y pulido.
 */
export default function App() {
  const [activeTab, setActiveTab] = useState<"visualizer" | "recommendation" | "versioning" | "markdown">("visualizer");
  const [copied, setCopied] = useState<boolean>(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdownText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-800 font-sans selection:bg-amber-200 selection:text-amber-900">
      {/* HEADER SECTION */}
      <header className="border-b border-stone-200 bg-white sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-900 text-white rounded-lg shadow-sm">
              <Database className="w-6 h-6" id="logo-icon" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs tracking-widest uppercase font-mono px-2 py-0.5 bg-amber-100 text-amber-800 rounded-sm font-semibold">
                  Data Architect Spec
                </span>
                <span className="text-xs text-stone-400 font-mono">v1.0.0</span>
              </div>
              <h1 className="text-xl font-semibold text-stone-900 tracking-tight" id="app-title">
                Arquitectura de Datos para Cátedras Universitarias
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-copy-header"
              onClick={copyToClipboard}
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copiado al portapapeles</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Especificación MD</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* CORE INFO SUMMARY FOR THE TEACHER */}
      <section className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-stone-100 py-10 px-6 shadow-md">
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

      {/* NAVIGATION TABS */}
      <main className="max-w-7xl mx-auto px-6 py-8">
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
        </div>

        {/* TAB CONTENTS */}
        {activeTab === "visualizer" && <VisualizerTab />}
        {activeTab === "recommendation" && <RecommendationTab />}
        {activeTab === "versioning" && <VersioningTab />}
        {activeTab === "markdown" && (
          <MarkdownTab copied={copied} copyToClipboard={copyToClipboard} />
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-stone-100 border-t border-stone-200 py-12 mt-16 text-center text-xs text-stone-500 font-mono">
        <div className="max-w-7xl mx-auto px-6 space-y-2">
          <p>Diseño de Arquitectura de Datos de Cátedras Académicas</p>
          <p className="text-stone-400">Pensado para integraciones ágiles de Google Sheets API en Google AI Studio & Cloud Run</p>
        </div>
      </footer>
    </div>
  );
}
