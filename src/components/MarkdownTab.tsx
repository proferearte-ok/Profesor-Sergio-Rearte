/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Copy, Check } from "lucide-react";
import { markdownText } from "../data/mockData";

interface MarkdownTabProps {
  copied: boolean;
  copyToClipboard: () => void;
}

/**
 * Componente que renderiza la especificación técnica en formato Markdown
 * y provee controles interactivos para copiarla.
 */
export default function MarkdownTab({ copied, copyToClipboard }: MarkdownTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base font-mono uppercase tracking-tight">Especificación Técnica en Markdown</h3>
          <p className="text-xs text-slate-500 mt-1 font-sans leading-relaxed">
            Copiá esta documentación estructurada con un click. Te servirá como la guía y especificación absoluta para conectar el API de Sheets al construir tu aplicación definitiva en Google AI Studio.
          </p>
        </div>
        <button
          id="btn-copy-tab"
          onClick={copyToClipboard}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider font-mono transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copiar Documento</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-slate-900 text-slate-200 rounded-2xl p-6 font-mono text-xs overflow-x-auto max-h-[600px] border border-slate-800 shadow-inner leading-relaxed">
        <pre className="whitespace-pre-wrap">{markdownText}</pre>
      </div>
    </div>
  );
}
