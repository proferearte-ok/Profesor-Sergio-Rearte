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
      <div className="bg-[#0F1420] border border-[#1E2531] rounded-2xl p-6 shadow-lg space-y-5">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-[#1E2531]/60 pb-4">
          <div className="space-y-1">
            <h4 className="font-bold flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-[#5B6577]">
              <Smartphone className="w-4 h-4 text-[#16C784]" />
              <span>Instrucciones de Acceso</span>
            </h4>
            <h3 className="text-base font-bold text-[#EDEFF3] font-sans">
              Unite a Remind
            </h3>
          </div>
          <a 
            href="https://www.remind.com" 
            target="_blank" 
            rel="noreferrer"
            className="w-full sm:w-auto text-center text-xs font-mono font-bold text-[#16C784] hover:underline flex items-center justify-center gap-1.5 bg-[#16C784]/10 hover:bg-[#16C784]/15 px-4 py-2.5 min-h-[44px] rounded-xl border border-[#16C784]/20 transition-all duration-150"
          >
            <span>Ir a Remind.com</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <p className="text-xs text-[#5B6577] font-sans leading-relaxed">
          {REMIND_CONFIG.description}. Podés seguir estos pasos sencillos para unirte a la clase:
        </p>

        {/* Pasos de Instrucción */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#131826]/40 border border-[#1E2531]/40 p-4 rounded-xl space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="w-6 h-6 rounded-lg bg-[#16C784]/10 text-[#16C784] font-mono text-xs font-bold flex items-center justify-center border border-[#16C784]/20">
                1
              </span>
              <p className="text-xs text-[#EDEFF3] font-medium leading-relaxed font-sans">
                Creá tu cuenta en <strong className="text-[#16C784]">Remind.com</strong> o descarga la app móvil.
              </p>
            </div>
          </div>

          <div className="bg-[#131826]/40 border border-[#1E2531]/40 p-4 rounded-xl space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="w-6 h-6 rounded-lg bg-[#16C784]/10 text-[#16C784] font-mono text-xs font-bold flex items-center justify-center border border-[#16C784]/20">
                2
              </span>
              <p className="text-xs text-[#EDEFF3] font-medium leading-relaxed font-sans">
                Ingresá a la opción <strong className="text-[#16C784]">"Add Class"</strong> en tu panel.
              </p>
            </div>
          </div>

          <div className="bg-[#131826]/40 border border-[#1E2531]/40 p-4 rounded-xl space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="w-6 h-6 rounded-lg bg-[#16C784]/10 text-[#16C784] font-mono text-xs font-bold flex items-center justify-center border border-[#16C784]/20">
                3
              </span>
              <p className="text-xs text-[#EDEFF3] font-medium leading-relaxed font-sans">
                Elegí la opción de <strong className="text-[#16C784]">"Join Existing Class"</strong>.
              </p>
            </div>
          </div>

          <div className="bg-[#131826]/10 border border-[#16C784]/30 p-4 rounded-xl space-y-2 flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-2 z-10">
              <span className="w-6 h-6 rounded-lg bg-[#16C784] text-white font-mono text-xs font-bold flex items-center justify-center">
                4
              </span>
              <p className="text-xs text-[#EDEFF3] font-medium leading-relaxed font-sans">
                Usá el código:
              </p>
              <div className="flex items-center justify-between gap-2 bg-[#0F1420] border border-[#1E2531] px-3 py-2 rounded-lg">
                <span className="font-mono text-xs text-[#16C784] font-bold tracking-wide select-all">
                  {REMIND_CONFIG.classCode}
                </span>
                <button
                  onClick={handleCopy}
                  type="button"
                  className="p-1.5 text-[#5B6577] hover:text-[#16C784] bg-[#131826] hover:bg-[#16C784]/10 border border-[#1E2531] hover:border-[#16C784]/20 rounded transition-all duration-150 shrink-0 min-h-[32px] min-w-[32px] flex items-center justify-center active:scale-95"
                  title="Copiar código"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-[#16C784]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WIDGET ORIGINAL CON EL CANAL EN VIVO */}
      <div className="bg-[#0F1420] border border-[#1E2531] rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex justify-between items-center border-b border-[#1E2531]/60 pb-3">
          <h4 className="font-bold flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-[#5B6577]">
            <Megaphone className="w-4 h-4 text-[#16C784]" />
            <span>CANAL DE AVISOS Y RECORDATORIOS (REMIND WIDGET)</span>
          </h4>
          <a 
            href="https://www.remind.com/join/54689070de95013e125f0242ac110025" 
            target="_blank" 
            rel="noreferrer"
            className="text-[10px] font-mono text-[#16C784] hover:underline flex items-center gap-1 bg-[#16C784]/10 px-2 py-1 rounded border border-[#16C784]/20 font-bold"
          >
            <span>Abrir Remind</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="flex gap-3 bg-[#131826]/40 border border-[#1E2531]/40 p-4 rounded-xl text-xs text-[#EDEFF3]/80 leading-relaxed font-sans">
          <Info className="w-5 h-5 text-[#16C784] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-[#EDEFF3] uppercase font-mono tracking-wider text-[9px]">Suscripción Directa:</p>
            <p className="text-[#5B6577] text-[11px]">
              Puedes sumarte al canal pulsando el botón <strong>"Join Class"</strong> que aparece en el widget inferior para recibir todas las novedades y anuncios de la cursada en tu móvil u ordenador.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-[#131826]/50 border border-[#1E2531]/60 p-2 min-h-[520px] flex flex-col justify-center">
          <div ref={containerRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
