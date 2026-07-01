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
      <div className="bg-white p-5 rounded-xl border border-stone-200 flex justify-between items-center gap-4">
        <div>
          <h3 className="font-semibold text-stone-900 text-lg">Especificación Técnica en Markdown</h3>
          <p className="text-xs text-stone-500 mt-1">
            Copiá esta documentación estructurada con un click. Te servirá como la guía y especificación absoluta para conectar el API de Sheets al construir tu aplicación definitiva en Google AI Studio.
          </p>
        </div>
        <button
          id="btn-copy-tab"
          onClick={copyToClipboard}
          className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
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

      <div className="bg-stone-900 text-stone-100 rounded-xl p-6 font-mono text-xs overflow-x-auto max-h-[600px] border border-stone-850 shadow-inner">
        <pre className="whitespace-pre-wrap">{markdownText}</pre>
      </div>
    </div>
  );
}
