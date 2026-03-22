import Icon from "@/components/ui/icon";
import { DOCS, LEGEND } from "@/data/docs";

interface SidebarProps {
  legendOpen: boolean;
  onLegendToggle: () => void;
  onDocClick: (title: string) => void;
}

export default function Sidebar({ legendOpen, onLegendToggle, onDocClick }: SidebarProps) {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-white/10 bg-[#0a0a0a] p-4 flex flex-col gap-3">
      <button
        onClick={onLegendToggle}
        className="flex items-center justify-between text-[10px] uppercase tracking-widest text-white/40 font-semibold hover:text-white/70 transition-colors"
      >
        <span>Аббревиатура</span>
        <Icon name={legendOpen ? "ChevronUp" : "ChevronDown"} size={12} />
      </button>

      {legendOpen && (
        <div className="flex flex-col gap-1.5">
          {LEGEND.map((item) => (
            <div key={item.icon} className="bg-[#141414] border border-white/8 rounded p-2.5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base leading-none">{item.icon}</span>
                <span className="text-xs font-semibold text-white/80 leading-tight">{item.label}</span>
              </div>
              <p className="text-[10px] text-white/35 leading-snug">{item.note}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2">
        <div className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-2">Документы</div>
        <div className="flex flex-col gap-1">
          {DOCS.map(doc => (
            <button
              key={doc.id}
              onClick={() => onDocClick(`Расскажи про регламент: ${doc.title}`)}
              className="text-left text-[10px] text-white/40 hover:text-red-400 transition-colors px-1 py-0.5 rounded hover:bg-white/5 truncate"
              title={doc.title}
            >
              [{doc.abbr}] {doc.title}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
