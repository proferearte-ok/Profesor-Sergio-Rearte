/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { Search, User, X, Check } from "lucide-react";

interface StudentSearchProps {
  studentNames: string[];
  placeholder?: string;
  onSelect: (studentName: string | null) => void;
  selectedStudent: string | null;
  cohortYear: number;
}

/**
 * Normaliza el texto quitando acentos y convirtiéndolo a minúsculas
 */
function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function StudentSearch({
  studentNames,
  placeholder = "Escribí tu apellido para buscar tu información",
  onSelect,
  selectedStudent,
  cohortYear,
}: StudentSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filtrar sugerencias basadas en la consulta normalizada
  useEffect(() => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const normalizedQuery = normalizeText(trimmedQuery);
    const filtered = studentNames.filter((name) => {
      const normalizedName = normalizeText(name);
      return normalizedName.includes(normalizedQuery);
    });

    // Limitar a máximo 10 sugerencias
    setSuggestions(filtered.slice(0, 10));
  }, [query, studentNames]);

  // Manejar clics fuera del contenedor para cerrar las sugerencias
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (name: string) => {
    onSelect(name);
    setQuery("");
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className="w-full max-w-md mx-auto" ref={containerRef}>
      <label className="block text-xs font-mono text-stone-600 uppercase tracking-wider mb-2 font-bold">
        BUSCADOR DE ALUMNOS (COHORTE <span className="font-mono">{cohortYear}</span>)
      </label>

      {selectedStudent ? (
        <div className="flex items-center justify-between bg-white border border-stone-200 rounded-2xl p-4 animate-fade-in shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-amber-900 text-amber-50 flex items-center justify-center font-bold text-base font-mono shadow-xs shadow-amber-900/20">
              {selectedStudent.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] text-amber-900/70 font-mono uppercase tracking-widest font-bold">Estudiante Seleccionado</p>
              <p className="text-base font-bold text-stone-900">{selectedStudent}</p>
            </div>
          </div>
          <button
            onClick={handleClear}
            className="p-2.5 bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-950 rounded-xl transition-colors cursor-pointer active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center border border-stone-200"
            title="Cambiar de estudiante"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="w-full pl-12 pr-11 py-3.5 bg-white border border-stone-300 text-stone-900 placeholder-stone-400 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all shadow-2xs font-sans min-h-[50px]"
            />
            <div className="absolute left-4 top-4 text-stone-400">
              <Search className="w-5 h-5 text-stone-400" />
            </div>
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3.5 top-3.5 p-1 text-stone-400 hover:text-stone-700 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* MENÚ DESPLEGABLE DE SUGERENCIAS */}
          {isOpen && query.trim().length >= 2 && (
            <div className="absolute z-30 w-full mt-2 bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden animate-fade-in max-h-[320px] overflow-y-auto">
              {suggestions.length > 0 ? (
                <div className="py-1">
                  <div className="px-4 py-2.5 bg-stone-100/90 text-xs font-mono text-stone-600 border-b border-stone-200 uppercase tracking-widest font-bold">
                    SUGERENCIAS ({suggestions.length})
                  </div>
                  {suggestions.map((name, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelect(name)}
                      className="w-full text-left px-4 py-3.5 hover:bg-amber-50 text-stone-900 text-sm flex items-center justify-between border-b border-stone-100 last:border-b-0 transition-colors cursor-pointer min-h-[48px]"
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-4.5 h-4.5 text-stone-400" />
                        <span className="font-sans font-semibold">{name}</span>
                      </div>
                      <Check className="w-4.5 h-4.5 text-amber-800" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-4 text-center text-stone-500 text-xs font-mono italic">
                  No se encontraron coincidencias para "{query}"
                </div>
              )}
            </div>
          )}

          {isOpen && query.trim().length < 2 && query.trim().length > 0 && (
            <div className="absolute z-30 w-full mt-2 bg-white border border-stone-200 rounded-2xl p-3.5 text-center text-stone-500 text-xs font-mono shadow-xl">
              Escribe al menos 2 caracteres para buscar...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
