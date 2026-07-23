/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Check, Lock, Layers } from "lucide-react";

/**
 * Componente que renderiza la pestaña de Recomendación: Sheets vs JSON.
 */
export default function RecommendationTab() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-2xs space-y-6">
      <h3 className="text-2xl font-bold tracking-tight text-slate-900 border-b border-slate-200/80 pb-4">
        Recomendación de Arquitectura: Google Sheets como Base de Datos
      </h3>
      
      <p className="text-slate-600 leading-relaxed font-sans text-sm">
        Para un docente que gestiona contenidos y rendimiento escolar manualmente, obligarlo a aprender formatos de bases de datos tradicionales o interfaces web complejas de administración representa una fricción enorme. 
        <strong className="text-slate-900"> Google Sheets es la solución ideal</strong> por los siguientes motivos:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
          <h4 className="font-bold text-emerald-950 flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Ventajas de Google Sheets</span>
          </h4>
          <ul className="text-xs text-slate-700 space-y-2.5 list-disc list-inside leading-relaxed">
            <li><strong>Curva de Aprendizaje Cero:</strong> El docente ya conoce y usa planillas de cálculo a diario para cargar asistencia y notas.</li>
            <li><strong>Actualización Offline/Móvil:</strong> Las apps oficiales de Google Sheets permiten cargar notas desde cualquier lugar con o sin internet.</li>
            <li><strong>Cómputos Libres:</strong> Puede usar fórmulas propias de Sheets (PROMEDIO, SI, BUSCARV) antes de que la web consuma el resultado final.</li>
            <li><strong>Control de Versiones Nativo:</strong> Historial de cambios integrado de Google Drive ante cualquier error involuntario.</li>
          </ul>
        </div>

        <div className="p-5 rounded-xl border border-rose-200 bg-rose-50/40 space-y-2">
          <h4 className="font-bold text-rose-950 flex items-center gap-2">
            <Lock className="w-5 h-5 text-rose-700 shrink-0" />
            <span>Por qué NO usar un JSON Estático</span>
          </h4>
          <ul className="text-xs text-slate-700 space-y-2.5 list-disc list-inside leading-relaxed">
            <li><strong>Frustración Tecnológica:</strong> Un docente modificando un JSON estático tiene un alto riesgo de romper la sintaxis (por ejemplo, omitir una coma, llave o comilla), lo cual haría crashear toda la web.</li>
            <li><strong>Redespliegue Necesario:</strong> Cada vez que se sube un apunte o se corrige una nota, se tendría que hacer un "commit & deploy" de la app en Cloud Run.</li>
            <li><strong>Dificultad de entrada múltiple:</strong> Si tiene un ayudante de cátedra, editar un archivo de código compartido es inviable.</li>
          </ul>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200/80">
        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>¿Cómo lee la app de React esta planilla de Google Sheets?</span>
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed mb-4 font-sans">
          El flujo de integración más robusto y de menor latencia no requiere complejas integraciones de Google Cloud SDK en el frontend. En su lugar, el docente simplemente selecciona <strong>Archivo &gt; Compartir &gt; Publicar en la Web</strong>, seleccionando las hojas en formato CSV.
        </p>
        <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-[11px] space-y-2 shadow-inner">
          <p className="text-slate-500">// La app lee el formato CSV nativo de Google de manera ultra rápida</p>
          <p className="text-slate-200">const ID_PLANILLA = "1A8zB_tu_id_de_google_sheets_aqui";</p>
          <p className="text-slate-200">const ID_HOJA_NOTAS = "0"; // GID de la hoja Notas_Esquema_Num</p>
          <p className="text-slate-200">const url = `https://docs.google.com/spreadsheets/d/{"{"}ID_PLANILLA{"}"}/export?format=csv&gid={"{"}ID_HOJA_NOTAS{"}"}`;</p>
          <p className="mt-2 text-slate-500">// En producción, el backend Express (server.ts) consulta esta URL, convierte el CSV a JSON</p>
          <p className="text-slate-500">// y lo expone en un endpoint seguro "/api/notas" para evitar exponer IDs públicamente.</p>
        </div>
      </div>
    </div>
  );
}
