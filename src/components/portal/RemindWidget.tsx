import { useEffect, useRef } from "react";
import { ExternalLink, MessageSquare, Megaphone, Info } from "lucide-react";

export default function RemindWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-[#0F1420] border border-[#1E2531] rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex justify-between items-center border-b border-[#1E2531]/60 pb-3">
          <h4 className="font-bold flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-[#5B6577]">
            <Megaphone className="w-4 h-4 text-[#16C784]" />
            <span>CANAL DE AVISOS Y RECORDATORIOS (REMIND)</span>
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
