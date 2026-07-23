/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Componente que renderiza la pestaña de Gestión de Históricos (Años).
 */
export default function VersioningTab() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-2xs space-y-6">
      <h3 className="text-2xl font-bold tracking-tight text-slate-900 border-b border-slate-200/80 pb-4">
        Gestión de Históricos por Año de Cohorte (Requisito 5)
      </h3>
      
      <p className="text-slate-600 leading-relaxed font-sans text-sm">
        Es muy común que los sistemas escolares pierdan su histórico porque el docente simplemente "sobreescribe" las notas y asistencias de los alumnos del año anterior con los del nuevo año lectivo. 
        Nuestra propuesta utiliza un <strong className="text-slate-900">versionado por columna único</strong> para mantener un archivo histórico sólido sin requerir la creación de nuevas planillas año tras año.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
        <div className="p-5 bg-slate-50/80 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-lg mb-2 block font-sans">📋</span>
          <h4 className="font-bold text-slate-900 text-sm mb-1 font-mono uppercase tracking-tight">1. Registro Continuo</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            El docente nunca borra los alumnos de los años anteriores. Simplemente agrega los nuevos alumnos al final de la planilla escribiendo el año vigente (por ejemplo, <code className="bg-white px-1 py-0.5 rounded border border-slate-200 text-indigo-700 font-mono">2026</code>) en la columna <strong>Anio</strong>.
          </p>
        </div>

        <div className="p-5 bg-slate-50/80 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-lg mb-2 block font-sans">🧭</span>
          <h4 className="font-bold text-slate-900 text-sm mb-1 font-mono uppercase tracking-tight">2. Control en Cátedras</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            En la hoja <strong>Cátedras</strong>, el docente especifica cuál es el <code className="bg-white px-1 py-0.5 rounded border border-slate-200 text-indigo-700 font-mono">Anio_Vigente</code> activo. Por ejemplo, al cambiar de <code className="bg-white px-1 py-0.5 rounded border border-slate-200 text-slate-600 font-mono">2025</code> a <code className="bg-white px-1 py-0.5 rounded border border-slate-200 text-indigo-700 font-mono">2026</code>, la web automáticamente oculta los alumnos antiguos y destaca los nuevos.
          </p>
        </div>

        <div className="p-5 bg-slate-50/80 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-lg mb-2 block font-sans">🏛️</span>
          <h4 className="font-bold text-slate-900 text-sm mb-1 font-mono uppercase tracking-tight">3. Selector de Histórico</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            La interfaz web puede incluir un selector discreto para que ex-alumnos de años anteriores puedan consultar sus notas finales buscando su nombre y filtrando por año.
          </p>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200/80">
        <h4 className="font-bold text-slate-900 mb-3 text-sm font-mono uppercase tracking-tight">Ejemplo Visual de Carga en Google Sheets (Hoja Asistencia)</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 uppercase">
                <th className="p-2.5 border border-slate-200">ID_Catedra</th>
                <th className="p-2.5 border border-slate-200 bg-indigo-50 text-indigo-950 font-bold">Anio</th>
                <th className="p-2.5 border border-slate-200">Estudiante</th>
                <th className="p-2.5 border border-slate-200">Porcentaje_Asistencia</th>
                <th className="p-2.5 border border-slate-200 text-slate-400 font-sans">Interpretación de la Web</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-slate-50/50 text-slate-400">
                <td className="p-2.5 border border-slate-200">BIO_MOL</td>
                <td className="p-2.5 border border-slate-200 bg-indigo-50/30 font-bold text-slate-400">2025</td>
                <td className="p-2.5 border border-slate-200">Alvarez, Pedro</td>
                <td className="p-2.5 border border-slate-200">90%</td>
                <td className="p-2.5 border border-slate-200 italic font-sans text-slate-400">Oculto por defecto (Guardado en histórico)</td>
              </tr>
              <tr className="bg-white">
                <td className="p-2.5 border border-slate-200 text-slate-900">BIO_MOL</td>
                <td className="p-2.5 border border-slate-200 bg-indigo-50 font-bold text-indigo-900">2026</td>
                <td className="p-2.5 border border-slate-200 font-bold text-slate-900">Pérez, Juan</td>
                <td className="p-2.5 border border-slate-200 font-bold text-slate-900">92%</td>
                <td className="p-2.5 border border-slate-200 text-emerald-700 font-semibold italic font-sans">Visible Activo (Cohorte Actual)</td>
              </tr>
              <tr className="bg-white">
                <td className="p-2.5 border border-slate-200 text-slate-900">BIO_MOL</td>
                <td className="p-2.5 border border-slate-200 bg-indigo-50 font-bold text-indigo-900">2026</td>
                <td className="p-2.5 border border-slate-200 font-bold text-slate-900">Rodríguez, María</td>
                <td className="p-2.5 border border-slate-200 font-bold text-slate-900">68%</td>
                <td className="p-2.5 border border-slate-200 text-emerald-700 font-semibold italic font-sans">Visible Activo (Cohorte Actual)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
