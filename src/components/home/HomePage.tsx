/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  GraduationCap, 
  ArrowRight, 
  Megaphone, 
  BookOpen, 
  Download, 
  ExternalLink, 
  Calendar, 
  CheckCircle2, 
  Loader2, 
  FileText, 
  Image as ImageIcon,
  Sparkles,
  Info,
  Layers,
  Clock
} from "lucide-react";
import { motion } from "motion/react";
import { Anuncio, Catedra } from "../../types";
import { mockCatedras, mockAnuncios } from "../../data/mockData";
import { getNovedadesFromSheet, getCatedrasFromSheet, isValidGoogleSheetId } from "../../services/googleSheets";
import { normalizeDriveImageUrl, normalizeDriveFileUrl } from "../../utils/driveLinks";

interface HomePageProps {
  onNavigateToPortal: (catedraId?: string) => void;
}

export default function HomePage({ onNavigateToPortal }: HomePageProps) {
  const [catedras, setCatedras] = useState<Catedra[]>(mockCatedras);
  const [novedades, setNovedades] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      const panelConfigSheetId = import.meta.env.VITE_SHEET_ID_PANEL_CONFIG;

      try {
        if (isValidGoogleSheetId(panelConfigSheetId)) {
          const sheetCats = await getCatedrasFromSheet(panelConfigSheetId!);
          if (sheetCats && sheetCats.length > 0 && isMounted) {
            setCatedras(sheetCats);
          }
        }
      } catch (err) {
        console.warn("Uso de cátedras por defecto:", err);
      }

      try {
        if (isValidGoogleSheetId(panelConfigSheetId)) {
          const sheetNovedades = await getNovedadesFromSheet(panelConfigSheetId!);
          if (isMounted) {
            setNovedades(sheetNovedades);
          }
        } else if (isMounted) {
          setNovedades(mockAnuncios);
        }
      } catch (err) {
        console.warn("Uso de novedades por defecto:", err);
        if (isMounted) {
          setNovedades(mockAnuncios);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* HERO SECTION / PRINCIPAL HEADER */}
      <section className="relative overflow-hidden rounded-3xl bg-[#1A1F35] text-white p-8 md:p-12 shadow-xl border border-stone-800">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-[#FCE19C] text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portal Académico Universitario 2026</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight font-sans text-white leading-tight">
              Cátedras de Biología Molecular y Tecnologías de Laboratorio
            </h1>
            <p className="text-stone-300 text-base md:text-xl font-sans leading-relaxed max-w-2xl font-normal">
              Profesor Sergio Rearte — Accedé al material de estudio, novedades de cursada, programas, comisiones y calificaciones de forma centralizada.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={() => onNavigateToPortal()}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-base font-sans tracking-wide shadow-lg hover:shadow-xl transition-all duration-200 active:scale-98 cursor-pointer group"
            >
              <GraduationCap className="w-6 h-6 text-[#FCE19C]" />
              <span>Ingresar al Portal de Estudiantes</span>
              <ArrowRight className="w-5 h-5 text-amber-200 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* CONTENEDOR PRINCIPAL DOS COLUMNAS EN DESKTOP / UNA COLUMNA EN MOBILE */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* SECCIÓN RESUMEN DE CÁTEDRAS (COLUMNA IZQUIERDA EN DESKTOP) */}
        <section className="md:col-span-5 lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200/90 pb-3">
            <div>
              <div className="flex items-center gap-2 text-amber-900 text-xs font-mono font-bold uppercase tracking-wider">
                <Layers className="w-4 h-4 text-amber-800" />
                <span>OFERTA ACADÉMICA</span>
              </div>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                Cátedras Universitarias
              </h2>
            </div>
            <span className="text-xs font-mono text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">
              2026
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {catedras.map((cat) => (
              <motion.div
                key={cat.id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-2.5"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200 shrink-0">
                      {cat.id}
                    </span>
                    {cat.activa ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Activa 2026
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 text-[11px] font-medium border border-stone-200 shrink-0">
                        Inactiva
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-stone-900 font-sans tracking-tight leading-snug">
                      {cat.nombre}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 font-mono mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{cat.cuatrimestre} ({cat.anio_vigente})</span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {cat.contenido_cronograma || "Programa completo, bibliografía oficial y notas en el portal."}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-stone-100">
                  <button
                    onClick={() => onNavigateToPortal(cat.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-stone-100 hover:bg-[#1A1F35] text-stone-800 hover:text-white rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all duration-150 cursor-pointer group"
                  >
                    <span>Ver Contenidos</span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-[#FCE19C] group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECCIÓN NOVEDADES / FEED DE COMUNICACIONES (COLUMNA DERECHA EN DESKTOP) */}
        <section className="md:col-span-7 lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200/90 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-200 shrink-0">
                <Megaphone className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-stone-900 tracking-tight">
                  Novedades &amp; Comunicaciones
                </h2>
                <p className="text-xs text-stone-600 font-sans hidden sm:block">
                  Avisos importantes y actualizaciones recientes de las cátedras.
                </p>
              </div>
            </div>
          </div>

        {loading ? (
          <div className="bg-white border border-stone-200/90 rounded-2xl p-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-amber-800 animate-spin mx-auto" />
            <p className="text-sm font-mono text-stone-600">Cargando novedades...</p>
          </div>
        ) : novedades.length === 0 ? (
          <div className="bg-white border border-stone-200/90 rounded-2xl p-10 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-800">No hay novedades por el momento</h3>
            <p className="text-xs text-stone-600 max-w-md mx-auto">
              Los avisos y comunicados publicados por los docentes aparecerán en esta sección.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {novedades.map((item) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-white border border-stone-200/90 rounded-2xl p-6 md:p-7 shadow-2xs space-y-4 hover:border-stone-300 transition-colors"
              >
                {/* HEADER TARJETA NOVEDAD */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-100/80 text-amber-950 border border-amber-200 text-xs font-mono font-bold">
                      <Clock className="w-3 h-3 text-amber-800" />
                      {item.fecha}
                    </span>
                    <span className="text-xs font-mono font-medium text-stone-600 uppercase tracking-wider bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200">
                      {item.tipoAnuncio}
                    </span>
                  </div>
                </div>

                {/* CONTENIDO TEXTO */}
                <div className="space-y-2">
                  <h3 className="text-lg md:text-xl font-bold text-stone-900 font-sans tracking-tight">
                    {item.titulo}
                  </h3>
                  {item.texto && (
                    <p className="text-stone-700 text-sm md:text-base leading-relaxed whitespace-pre-line font-sans">
                      {item.texto}
                    </p>
                  )}
                </div>

                {/* IMAGEN CONDICIONAL */}
                {(item.tipoAnuncio === "Imagen" || item.tipoAnuncio === "Mixto" || !!item.linkImagen) && Boolean(item.linkImagen) && (
                  <div className="pt-1">
                    <div className="rounded-xl overflow-hidden border border-stone-200 bg-stone-50 max-h-96">
                      <img
                        src={normalizeDriveImageUrl(item.linkImagen)}
                        alt={item.titulo}
                        referrerPolicy="no-referrer"
                        className="w-full h-auto max-h-96 object-contain bg-stone-100"
                        onError={(e) => {
                          // Si falla cargar la imagen, ocultar el contenedor completo
                          const target = e.currentTarget;
                          const container = target.closest('.pt-1') as HTMLElement;
                          if (container) {
                            container.style.display = 'none';
                          } else {
                            target.style.display = 'none';
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* ARCHIVO ADJUNTO CONDICIONAL */}
                {(item.tipoAnuncio === "Archivo" || item.tipoAnuncio === "Mixto" || !!item.linkArchivo) && Boolean(item.linkArchivo) && (
                  <div className="pt-2">
                    <a
                      href={normalizeDriveFileUrl(item.linkArchivo)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-mono text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-98"
                    >
                      <Download className="w-4 h-4 text-amber-800" />
                      <span>Descargar Documento / Archivo Adjunto</span>
                      <ExternalLink className="w-3.5 h-3.5 text-amber-700 opacity-70" />
                    </a>
                  </div>
                )}
              </motion.article>
            ))}
          </div>
        )}
      </section>
      </div>
    </div>
  );
}
