import { LEGEND } from "@/data/docs";

export default function Sidebar() {
  const items = [...LEGEND, ...LEGEND, ...LEGEND];

  return (
    <aside className="w-10 flex-shrink-0 border-r border-white/10 bg-[#0a0a0a] relative overflow-hidden">
      <div className="legend-scroll flex flex-col gap-4 py-4 px-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-1 group cursor-default">
            <span className="text-lg leading-none">{item.icon}</span>
            <div className="absolute left-12 z-50 hidden group-hover:flex flex-col bg-[#1a1a1a] border border-white/15 rounded-lg shadow-2xl p-3 w-48 pointer-events-none">
              <span className="text-xs font-semibold text-white/90 leading-tight mb-1">{item.label}</span>
              <span className="text-[10px] text-white/45 leading-snug">{item.note}</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
