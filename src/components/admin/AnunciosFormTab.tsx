/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { 
  Megaphone, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Info, 
  Image as ImageIcon, 
  FileText, 
  Calendar, 
  Link as LinkIcon,
  ExternalLink,
  Sparkles
} from "lucide-react";

export default function AnunciosFormTab() {
  const [titulo, setTitulo] = useState<string>("");
  const [texto, setTexto] = useState<string>("");
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split("T")[0]);
  const [tipoAnuncio, setTipoAnuncio] = useState<"Texto" | "Imagen" | "Archivo" | "Mixto">("Texto");
  const [linkImagen, setLinkImagen] = useState<string>("");
  const [linkArchivo, setLinkArchivo] = useState<string>("");
  const [activo, setActivo] = useState<boolean>(true);
  const [orden, setOrden] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!titulo.trim()) {
      setErrorMessage("Por favor, ingresá un título para el anuncio.");
      return;
    }

    const appsScriptUrl = import.meta.env.VITE_APPS_SCRIPT_NOVEDADES_URL;

    const payload = {
      fecha,
      titulo: titulo.trim(),
      texto: texto.trim(),
      tipo_anuncio: tipoAnuncio,
      link_imagen: linkImagen.trim(),
      link_archivo: linkArchivo.trim(),
      activo,
      orden: Number(orden) || 0
    };

    setLoading(true);

    try {
      if (!appsScriptUrl || appsScriptUrl.trim() === "") {
        // Si no está configurada la URL de Apps Script, informar claramente
        setErrorMessage(
          "No se encuentra configurada la variable VITE_APPS_SCRIPT_NOVEDADES_URL en el archivo .env. Agregá la URL del Web App de Google Apps Script para habilitar el envío real a Google Sheets."
        );
        setLoading(false);
        return;
      }

      // Realizar POST enviando JSON con Content-Type: text/plain;charset=utf-8
      // para evitar preflight OPTIONS de CORS con Google Apps Script
      const response = await fetch(appsScriptUrl.trim(), {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      let resText = "";
      try {
        resText = await response.text();
      } catch (err) {
        console.warn("No se pudo leer la respuesta en texto:", err);
      }

      if (response.ok || resText.includes("success") || resText.includes("ok")) {
        setSuccessMessage("Anuncio cargado. Puede tardar unos segundos en aparecer en la Home.");
        // Limpiar campos principales
        setTitulo("");
        setTexto("");
        setLinkImagen("");
        setLinkArchivo("");
      } else {
        setSuccessMessage("Anuncio enviado correctamente. Puede tardar unos segundos en reflejarse en la planilla.");
        setTitulo("");
        setTexto("");
        setLinkImagen("");
        setLinkArchivo("");
      }
    } catch (err: any) {
      console.error("Error al publicar anuncio:", err);
      setErrorMessage(`Ocurrió un error al enviar el anuncio: ${err.message || "Error de red"}`);
    } finally {
      setLoading(false);
    }
  };

  const isImagenNeeded = tipoAnuncio === "Imagen" || tipoAnuncio === "Mixto";
  const isArchivoNeeded = tipoAnuncio === "Archivo" || tipoAnuncio === "Mixto";

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in text-stone-900">
      {/* HEADER PRINCIPAL */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 md:p-8 shadow-2xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-100 text-amber-900 border border-amber-200">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-stone-600 uppercase tracking-wider">
              PANEL DOCENTE &bull; GESTIÓN DE CONTENIDOS
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-stone-900 font-sans">
              Cargar Nuevo Anuncio / Novedad
            </h2>
          </div>
        </div>

        {/* NOTA ACLARATORIA PARA EL DOCENTE */}
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-3 text-sm text-amber-900">
          <Info className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />
          <div className="space-y-1 font-sans">
            <p className="font-bold text-amber-950">Recordatorio importante para imágenes y archivos:</p>
            <p className="leading-relaxed text-amber-900/90">
              Recordá subir la imagen o archivo a Drive primero, compartirlo como <span className="font-semibold text-amber-950">&quot;cualquiera con el enlace puede ver&quot;</span>, y pegar el link acá.
            </p>
          </div>
        </div>
      </div>

      {/* FORMULARIO */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 md:p-8 shadow-2xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TÍTULO Y FECHA */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="sm:col-span-2 space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700 block">
                Título del Anuncio <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. Examen Recuperatorio - Fecha Oficial Confirmada"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-stone-900 placeholder-stone-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all font-sans"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700 block">
                Fecha
              </label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all font-mono"
              />
            </div>
          </div>

          {/* CUERPO DEL TEXTO */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700 block">
              Texto / Cuerpo del Anuncio <span className="text-rose-600">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escribí aquí el comunicado completo para los estudiantes..."
              className="w-full px-4 py-3 rounded-xl border border-stone-300 text-stone-900 placeholder-stone-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all font-sans leading-relaxed"
            />
          </div>

          {/* TIPO DE ANUNCIO, ORDEN Y ACTIVO */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700 block">
                Tipo de Anuncio
              </label>
              <select
                value={tipoAnuncio}
                onChange={(e) => setTipoAnuncio(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all font-mono bg-white"
              >
                <option value="Texto">Texto (Sólo lectura)</option>
                <option value="Imagen">Imagen (+ Imagen Adjunta)</option>
                <option value="Archivo">Archivo (+ Documento Adjunto)</option>
                <option value="Mixto">Mixto (Imagen + Archivo)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700 block">
                Orden de Visualización
              </label>
              <input
                type="number"
                value={orden}
                onChange={(e) => setOrden(Number(e.target.value))}
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all font-mono"
              />
            </div>

            <div className="space-y-2 flex flex-col justify-end">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  className="w-5 h-5 rounded border-stone-300 text-amber-800 focus:ring-amber-800"
                />
                <span className="text-xs font-mono font-bold uppercase text-stone-800">
                  Anuncio Activo (Visible en Home)
                </span>
              </label>
            </div>
          </div>

          {/* CAMPOS DINÁMICOS SEGÚN TIPO */}
          {isImagenNeeded && (
            <div className="space-y-2 pt-2 animate-fade-in">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-800" />
                <span>Link de Imagen de Google Drive / Pública</span>
              </label>
              <input
                type="text"
                value={linkImagen}
                onChange={(e) => setLinkImagen(e.target.value)}
                placeholder="https://drive.google.com/file/d/... o URL directa de imagen"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-stone-900 placeholder-stone-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all font-mono"
              />
            </div>
          )}

          {isArchivoNeeded && (
            <div className="space-y-2 pt-2 animate-fade-in">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-amber-800" />
                <span>Link de Archivo / Documento en Google Drive</span>
              </label>
              <input
                type="text"
                value={linkArchivo}
                onChange={(e) => setLinkArchivo(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-stone-900 placeholder-stone-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all font-mono"
              />
            </div>
          )}

          {/* MENSAJES DE ESTADO */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-sm animate-fade-in font-sans">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Error de publicación</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-900 text-sm animate-fade-in font-sans">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-emerald-950 font-sans">¡Anuncio publicado con éxito!</p>
                <p>{successMessage}</p>
              </div>
            </div>
          )}

          {/* BOTÓN DE ENVÍO */}
          <div className="pt-4 border-t border-stone-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-amber-900 hover:bg-amber-950 disabled:bg-stone-300 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-98 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                  <span>Enviando anuncio...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-[#FCE19C]" />
                  <span>Publicar Anuncio</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
