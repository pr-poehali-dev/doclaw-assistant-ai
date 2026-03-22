import Icon from "@/components/ui/icon";
import { DOCS } from "@/data/docs";

interface DocsViewProps {
  onDocClick: (title: string) => void;
}

export default function DocsView({ onDocClick }: DocsViewProps) {
  return (
    <div className="flex-1">
      <div className="grid gap-3">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-white" style={{ fontFamily: "'IBM Plex Serif', serif" }}>База регламентов</h2>
          <span className="text-xs text-white/40">{DOCS.length} документов</span>
        </div>
        {DOCS.map((doc) => (
          <div
            key={doc.id}
            className="bg-[#0f0f0f] rounded border border-white/10 shadow-sm hover:border-red-600 transition-all cursor-pointer group"
            onClick={() => onDocClick(`Расскажи подробно про: ${doc.title}`)}
          >
            <div className="flex items-start justify-between gap-4 p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded bg-[#1a1a1a] border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon name="FileText" size={14} className="text-red-500" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-red-500 bg-red-950/50 px-2 py-0.5 rounded">[{doc.abbr}]</span>
                    {doc.severity && <span className="text-xs text-white/30">{doc.severity}</span>}
                  </div>
                  <h3 className="font-medium text-white text-sm">{doc.title}</h3>
                  <p className="text-[11px] text-white/30 mt-0.5">{doc.points.length} пунктов</p>
                </div>
              </div>
              <Icon name="ChevronRight" size={14} className="text-white/20 group-hover:text-red-500 transition-colors flex-shrink-0 mt-1" />
            </div>
            <div className="px-4 pb-3 border-t border-white/5 pt-2 space-y-1">
              {doc.points.slice(0, 2).map((pt, i) => (
                <div key={i} className="text-[11px] text-white/35 flex gap-2">
                  <span className="text-red-600/60 flex-shrink-0">{pt.num}</span>
                  <span className="truncate">{pt.text}</span>
                </div>
              ))}
              {doc.points.length > 2 && <div className="text-[10px] text-white/20">...ещё {doc.points.length - 2} пунктов</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
