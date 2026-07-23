import { useEffect, useRef, useState } from "react";
import { ExternalLink, Megaphone, Info, Check, Copy, UserPlus, FileText, Smartphone } from "lucide-react";
import { REMIND_CONFIG } from "../../config/remind";

export default function RemindWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous children to avoid duplicate script/iframe loads
    containerRef.current.innerHTML = "";

    // Create container element that the Remind widget loader looks for or appends to
    const widgetTarget = document.createElement("div");
    widgetTarget.id = "remind-widget-target";
    containerRef.current.appendChild(widgetTarget);

    const script = document.createElement("script");
    script.src = "https://widgets.remind.com/iframe.js?token=54689070de95013e125f0242ac110025&height=500&join=true";
    script.async = true;

    // Append script to our target element so it executes and injects its iframe
    widgetTarget.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(REMIND_CONFIG.classCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* TARJETA INSTRUCCIONES: UNITE A REMIND */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-stone-200 pb-4">
          <div className="space-y-1">
            <h4 className="font-bold flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-stone-600">
              <Smartphone className="w-4.5 h-4.5 text-amber-800" />
              <span>Instrucciones de Acceso</span>
            </h4>
            <h3 className="text-lg font-bold text-stone-900 font-sans">
              Unite a Remind
            </h3>
          </div>
          <a 
            href="https://www.remind.com" 
            target="_blank" 
            rel="noreferrer"
            className="w-full sm:w-auto text-center text-sm font-mono font-bold text-amber-900 hover:underline flex items-center justify-center gap-2 bg-amber-100/80 hover:bg-amber-200/80 px-4.5 py-2.5 min-h-[46px] rounded-xl border border-amber-300/80 transition-all duration-150"
          >
            <span>Ir a Remind.com</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <p className="text-sm text-stone-700 font-sans leading-relaxed">
          {REMIND_CONFIG.description}. Podés seguir estos pasos sencillos para unirte a la clase:
        </p>

        {/* Pasos de Instrucción */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-stone-50 border border-stone-200/90 p-4.5 rounded-xl space-y-2 flex flex-col justify-between">
            <div className="space-y-2.5">
              <span className="w-7 h-7 rounded-lg bg-amber-900 text-amber-50 font-mono text-sm font-bold flex items-center justify-center shadow-xs">
                1
              </span>
              <p className="text-sm text-stone-800 font-medium leading-relaxed font-sans">
                Creá tu cuenta en <strong className="text-amber-900 font-bold">Remind.com</strong> o descarga la app móvil.
              </p>
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200/90 p-4.5 rounded-xl space-y-2 flex flex-col justify-between">
            <div className="space-y-2.5">
              <span className="w-7 h-7 rounded-lg bg-amber-900 text-amber-50 font-mono text-sm font-bold flex items-center justify-center shadow-xs">
                2
              </span>
              <p className="text-sm text-stone-800 font-medium leading-relaxed font-sans">
                Ingresá a la opción <strong className="text-amber-900 font-bold">"Add Class"</strong> en tu panel.
              </p>
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200/90 p-4.5 rounded-xl space-y-2 flex flex-col justify-between">
            <div className="space-y-2.5">
              <span className="w-7 h-7 rounded-lg bg-amber-900 text-amber-50 font-mono text-sm font-bold flex items-center justify-center shadow-xs">
                3
              </span>
              <p className="text-sm text-stone-800 font-medium leading-relaxed font-sans">
                Elegí la opción de <strong className="text-amber-900 font-bold">"Join Existing Class"</strong>.
              </p>
            </div>
          </div>

          <div className="bg-amber-100/60 border border-amber-300/80 p-4.5 rounded-xl space-y-2 flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-2.5 z-10">
              <span className="w-7 h-7 rounded-lg bg-amber-900 text-amber-50 font-mono text-sm font-bold flex items-center justify-center shadow-xs">
                4
              </span>
              <p className="text-sm text-stone-800 font-medium leading-relaxed font-sans">
                Usá el código:
              </p>
              <div className="flex items-center justify-between gap-2 bg-white border border-amber-300/80 px-3 py-2 rounded-xl shadow-2xs">
                <span className="font-mono text-sm text-amber-950 font-bold tracking-wide select-all">
                  {REMIND_CONFIG.classCode}
                </span>
                <button
                  onClick={handleCopy}
                  type="button"
                  className="p-1.5 text-stone-500 hover:text-amber-900 bg-stone-100 hover:bg-amber-100 border border-stone-200 hover:border-amber-300 rounded-lg transition-all duration-150 shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center active:scale-95 cursor-pointer"
                  title="Copiar código"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WIDGET ORIGINAL CON EL CANAL EN VIVO */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex justify-between items-center border-b border-stone-200 pb-3.5">
          <h4 className="font-bold flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-stone-600">
            <Megaphone className="w-4.5 h-4.5 text-amber-800" />
            <span>CANAL DE AVISOS Y RECORDATORIOS (REMIND WIDGET)</span>
          </h4>
          <a 
            href="https://www.remind.com/join/54689070de95013e125f0242ac110025" 
            target="_blank" 
            rel="noreferrer"
            className="text-xs font-mono text-amber-900 hover:underline flex items-center gap-1.5 bg-amber-100/80 px-3 py-1.5 rounded-lg border border-amber-300/80 font-bold"
          >
            <span>Abrir Remind</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="flex gap-3 bg-stone-50 border border-stone-200 p-4 rounded-xl text-sm text-stone-700 leading-relaxed font-sans">
          <Info className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-stone-900 uppercase font-mono tracking-wider text-xs">Suscripción Directa:</p>
            <p className="text-stone-700 text-xs md:text-sm">
              Puedes sumarte al canal pulsando el botón <strong>"Join Class"</strong> que aparece en el widget inferior para recibir todas las novedades y anuncios de la cursada en tu móvil u ordenador.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-stone-900 border border-stone-800 p-2 min-h-[520px] flex flex-col justify-center">
          <div ref={containerRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
