/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Componente que renderiza la pestaña de Gestión de Históricos (Años).
 */
export default function VersioningTab() {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm space-y-6">
      <h3 className="text-2xl font-bold tracking-tight text-stone-900 border-b border-stone-200 pb-3">
        Gestión de Históricos por Año de Cohorte (Requisito 5)
      </h3>
      
      <p className="text-stone-600 leading-relaxed">
        Es muy común que los sistemas escolares pierdan su histórico porque el docente simplemente "sobreescribe" las notas y asistencias de los alumnos del año anterior con los del nuevo año lectivo. 
        Nuestra propuesta utiliza un <strong>versionado por columna único</strong> para mantener un archivo histórico sólido sin requerir la creación de nuevas planillas año tras año.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
        <div className="p-5 bg-[#FAF9F6] rounded-xl border border-stone-200">
          <span className="text-lg mb-2 block font-sans">📋</span>
          <h4 className="font-bold text-stone-900 text-sm mb-1">1. Registro Continuo</h4>
          <p className="text-xs text-stone-500 leading-relaxed">
            El docente nunca borra los alumnos de los años anteriores. Simplemente agrega los nuevos alumnos al final de la planilla escribiendo el año vigente (por ejemplo, <code>2026</code>) en la columna <strong>Anio</strong>.
          </p>
        </div>

        <div className="p-5 bg-[#FAF9F6] rounded-xl border border-stone-200">
          <span className="text-lg mb-2 block font-sans">🧭</span>
          <h4 className="font-bold text-stone-900 text-sm mb-1">2. Control en Cátedras</h4>
          <p className="text-xs text-stone-500 leading-relaxed">
            En la hoja <strong>Cátedras</strong>, el docente especifica cuál es el <code>Anio_Vigente</code> activo. Por ejemplo, al cambiar de <code>2025</code> a <code>2026</code>, la web automáticamente oculta los alumnos antiguos y destaca los nuevos.
          </p>
        </div>

        <div className="p-5 bg-[#FAF9F6] rounded-xl border border-stone-200">
          <span className="text-lg mb-2 block font-sans">🏛️</span>
          <h4 className="font-bold text-stone-900 text-sm mb-1">3. Selector de Histórico</h4>
          <p className="text-xs text-stone-500 leading-relaxed">
            La interfaz web puede incluir un selector discreto para que ex-alumnos de años anteriores puedan consultar sus notas finales buscando su nombre y filtrando por año.
          </p>
        </div>
      </div>

      <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
        <h4 className="font-bold text-stone-900 mb-3 text-sm">Ejemplo Visual de Carga en Google Sheets (Hoja Asistencia)</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs bg-white rounded-lg border border-stone-200">
            <thead>
              <tr className="bg-stone-100 text-stone-700">
                <th className="p-2.5 border border-stone-200">ID_Catedra</th>
                <th className="p-2.5 border border-stone-200 bg-amber-50 text-amber-950 font-bold">Anio</th>
                <th className="p-2.5 border border-stone-200">Estudiante</th>
                <th className="p-2.5 border border-stone-200">Porcentaje_Asistencia</th>
                <th className="p-2.5 border border-stone-200 text-stone-400">Interpretación de la Web</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-stone-50/50 text-stone-400">
                <td className="p-2.5 border border-stone-200">BIO_MOL</td>
                <td className="p-2.5 border border-stone-200 bg-amber-50/50 font-bold">2025</td>
                <td className="p-2.5 border border-stone-200">Alvarez, Pedro</td>
                <td className="p-2.5 border border-stone-200">90%</td>
                <td className="p-2.5 border border-stone-200 italic">Oculto por defecto (Guardado en histórico)</td>
              </tr>
              <tr className="bg-white">
                <td className="p-2.5 border border-stone-200">BIO_MOL</td>
                <td className="p-2.5 border border-stone-200 bg-amber-50 font-bold text-amber-900">2026</td>
                <td className="p-2.5 border border-stone-200 font-bold">Pérez, Juan</td>
                <td className="p-2.5 border border-stone-200 font-bold text-stone-900">92%</td>
                <td className="p-2.5 border border-stone-200 text-emerald-700 font-semibold italic">Visible Activo (Cohorte Actual)</td>
              </tr>
              <tr className="bg-white">
                <td className="p-2.5 border border-stone-200">BIO_MOL</td>
                <td className="p-2.5 border border-stone-200 bg-amber-50 font-bold text-amber-900">2026</td>
                <td className="p-2.5 border border-stone-200 font-bold">Rodríguez, María</td>
                <td className="p-2.5 border border-stone-200 font-bold text-stone-900">68%</td>
                <td className="p-2.5 border border-stone-200 text-emerald-700 font-semibold italic">Visible Activo (Cohorte Actual)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
