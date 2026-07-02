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
      <label className="block text-xs font-mono text-stone-500 uppercase tracking-wider mb-2">
        Buscador de Alumnos (Cohorte {cohortYear})
      </label>

      {selectedStudent ? (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg p-3.5 animate-fade-in shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-900 text-amber-50 flex items-center justify-center font-bold text-sm">
              {selectedStudent.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-stone-400 font-mono">Estudiante Seleccionado</p>
              <p className="text-sm font-semibold text-stone-900">{selectedStudent}</p>
            </div>
          </div>
          <button
            onClick={handleClear}
            className="p-1.5 hover:bg-amber-100 rounded-full text-stone-500 hover:text-stone-800 transition-colors cursor-pointer active:scale-95"
            title="Cambiar de estudiante"
          >
            <X className="w-4 h-4" />
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
              className="w-full pl-10 pr-10 py-3 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-xs placeholder:text-stone-400 font-sans"
            />
            <div className="absolute left-3.5 top-3.5 text-stone-400">
              <Search className="w-4 h-4" />
            </div>
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-3 p-1 text-stone-400 hover:text-stone-600 rounded-full cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* MENÚ DESPLEGABLE DE SUGERENCIAS */}
          {isOpen && query.trim().length >= 2 && (
            <div className="absolute z-30 w-full mt-1.5 bg-white border border-stone-150 rounded-lg shadow-lg overflow-hidden animate-fade-in max-h-[300px] overflow-y-auto">
              {suggestions.length > 0 ? (
                <div className="py-1">
                  <div className="px-3 py-1.5 bg-stone-50 text-[10px] font-mono text-stone-400 border-b border-stone-100 uppercase tracking-wider">
                    Sugerencias ({suggestions.length})
                  </div>
                  {suggestions.map((name, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelect(name)}
                      className="w-full text-left px-4 py-2.5 hover:bg-amber-50 text-stone-800 hover:text-amber-950 text-xs flex items-center justify-between border-b border-stone-50 last:border-b-0 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        <span>{name}</span>
                      </div>
                      <Check className="w-3.5 h-3.5 text-amber-600 opacity-0 group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-4 text-center text-stone-400 text-xs italic">
                  No se encontraron coincidencias para "{query}"
                </div>
              )}
            </div>
          )}

          {isOpen && query.trim().length < 2 && query.trim().length > 0 && (
            <div className="absolute z-30 w-full mt-1.5 bg-stone-50 border border-stone-150 rounded-lg p-3 text-center text-stone-400 text-xs shadow-md">
              Escribe al menos 2 caracteres para buscar...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
