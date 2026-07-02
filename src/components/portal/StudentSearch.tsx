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
      <label className="block text-[10px] font-mono text-[#5B6577] uppercase tracking-wider mb-2 font-bold">
        BUSCADOR DE ALUMNOS (COHORTE <span className="font-mono">{cohortYear}</span>)
      </label>

      {selectedStudent ? (
        <div className="flex items-center justify-between bg-[#0F1420] border border-[#1E2531] rounded-xl p-3.5 animate-fade-in shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[#16C784] flex items-center justify-center font-bold text-sm font-mono">
              {selectedStudent.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[9px] text-[#5B6577] font-mono uppercase tracking-widest">Estudiante Seleccionado</p>
              <p className="text-sm font-bold text-[#EDEFF3]">{selectedStudent}</p>
            </div>
          </div>
          <button
            onClick={handleClear}
            className="p-2.5 bg-[#131826] hover:bg-[#1E2531] text-[#5B6577] hover:text-[#EDEFF3] rounded-lg transition-colors cursor-pointer active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
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
              className="w-full pl-11 pr-11 py-3.5 bg-[#131826] border border-[#1E2531] text-[#EDEFF3] placeholder-[#5B6577] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#16C784]/30 focus:border-[#16C784] transition-all shadow-md font-sans min-h-[48px]"
            />
            <div className="absolute left-4 top-4 text-[#5B6577]">
              <Search className="w-4 h-4" />
            </div>
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3.5 top-3.5 p-1 text-[#5B6577] hover:text-[#EDEFF3] rounded-full cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* MENÚ DESPLEGABLE DE SUGERENCIAS */}
          {isOpen && query.trim().length >= 2 && (
            <div className="absolute z-30 w-full mt-1.5 bg-[#131826] border border-[#1E2531] rounded-xl shadow-2xl overflow-hidden animate-fade-in max-h-[300px] overflow-y-auto">
              {suggestions.length > 0 ? (
                <div className="py-1">
                  <div className="px-4 py-2.5 bg-[#0F1420] text-[9px] font-mono text-[#5B6577] border-b border-[#1E2531] uppercase tracking-widest">
                    SUGERENCIAS ({suggestions.length})
                  </div>
                  {suggestions.map((name, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelect(name)}
                      className="w-full text-left px-4 py-3 hover:bg-[#1E2531] text-[#EDEFF3] text-xs flex items-center justify-between border-b border-[#1E2531]/40 last:border-b-0 transition-colors cursor-pointer min-h-[44px]"
                    >
                      <div className="flex items-center gap-2.5">
                        <User className="w-4 h-4 text-[#5B6577]" />
                        <span className="font-sans font-medium">{name}</span>
                      </div>
                      <Check className="w-4 h-4 text-[#16C784]" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-4 text-center text-[#5B6577] text-xs font-mono italic">
                  No se encontraron coincidencias para "{query}"
                </div>
              )}
            </div>
          )}

          {isOpen && query.trim().length < 2 && query.trim().length > 0 && (
            <div className="absolute z-30 w-full mt-1.5 bg-[#0F1420] border border-[#1E2531] rounded-xl p-3 text-center text-[#5B6577] text-xs font-mono shadow-xl">
              Escribe al menos 2 caracteres para buscar...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
