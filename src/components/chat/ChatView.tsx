import { useRef } from "react";
import Icon from "@/components/ui/icon";
import { Message, Doc, highlightMatch, SUGGESTIONS } from "@/data/docs";

interface ChatViewProps {
  messages: Message[];
  input: string;
  loading: boolean;
  started: boolean;
  suggestions: Doc[];
  showSuggestions: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  bottomRef: React.RefObject<HTMLDivElement>;
  suggestRef: React.RefObject<HTMLDivElement>;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onFocus: () => void;
  onSend: (text: string) => void;
  onPickSuggestion: (doc: Doc) => void;
}

function SuggestionsDropdown({
  show,
  suggestions,
  input,
  above,
  suggestRef,
  onPick,
}: {
  show: boolean;
  suggestions: Doc[];
  input: string;
  above: boolean;
  suggestRef: React.RefObject<HTMLDivElement>;
  onPick: (doc: Doc) => void;
}) {
  if (!show) return null;
  return (
    <div
      ref={suggestRef}
      className={`absolute left-0 right-0 z-50 bg-[#1a1a1a] border border-white/15 rounded-lg shadow-2xl overflow-hidden ${above ? "bottom-full mb-2" : "top-full mt-2"}`}
    >
      <div className="px-3 py-2 border-b border-white/10">
        <span className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Найдено в регламентах</span>
      </div>
      {suggestions.map((doc) => (
        <button
          key={doc.id}
          onMouseDown={() => onPick(doc)}
          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left group"
        >
          <div className="w-7 h-7 rounded bg-red-950/60 border border-red-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Icon name="FileText" size={12} className="text-red-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm text-white font-medium truncate">{highlightMatch(doc.title, input)}</div>
            {doc.abbr && <div className="text-[10px] text-red-400 mt-0.5">[{doc.abbr}] {doc.severity}</div>}
          </div>
          <Icon name="ArrowUpLeft" size={13} className="text-white/20 group-hover:text-red-400 flex-shrink-0 mt-1 transition-colors" />
        </button>
      ))}
    </div>
  );
}

export default function ChatView({
  messages,
  input,
  loading,
  started,
  suggestions,
  showSuggestions,
  inputRef,
  bottomRef,
  suggestRef,
  onInputChange,
  onKeyDown,
  onFocus,
  onSend,
  onPickSuggestion,
}: ChatViewProps) {
  if (!started) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
        <img src="https://cdn.poehali.dev/projects/85353fca-ddfd-4c1f-b5b0-734001ac6cf9/bucket/74dd8a8f-7d36-4f03-bf91-a641f9112d81.png" alt="Guard" className="w-20 h-20 object-contain mb-6 opacity-90" />
        <h1 className="text-2xl font-semibold text-white mb-2" style={{ fontFamily: "'IBM Plex Serif', serif" }}>Помощник Guard</h1>
        <p className="text-sm text-white/50 mb-10 text-center max-w-sm">Задайте вопрос по документам, регламентам или правовым процедурам</p>

        <div className="flex flex-wrap gap-2 justify-center mb-8 max-w-xl">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => onSend(s)}
              className="text-xs px-4 py-2 rounded-full border border-red-600 text-red-400 hover:bg-red-600 hover:text-white transition-all">
              {s}
            </button>
          ))}
        </div>

        <div className="w-full max-w-xl relative">
          <SuggestionsDropdown show={showSuggestions} suggestions={suggestions} input={input} above={false} suggestRef={suggestRef} onPick={onPickSuggestion} />
          <div className="flex gap-3 items-end bg-[#141414] rounded-lg border-2 border-red-600 shadow-md px-4 py-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={onKeyDown}
              onFocus={onFocus}
              placeholder="Введите ваш вопрос..."
              rows={1}
              className="flex-1 resize-none text-sm outline-none bg-transparent max-h-32 text-white placeholder:text-white/30"
              style={{ lineHeight: "1.6" }}
              onInput={(e) => { const t = e.currentTarget; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 128) + "px"; }}
            />
            <button
              onClick={() => onSend(input)}
              disabled={!input.trim()}
              className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 disabled:opacity-30 transition-all flex-shrink-0"
            >
              <Icon name="Send" size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f0f] rounded border border-white/10 shadow-sm overflow-hidden animate-fade-in" style={{ minHeight: "calc(100vh - 200px)" }}>
      <div className="flex-1 overflow-y-auto p-6 space-y-5 chat-scrollbar">
        {messages.map((msg, i) => (
          <div key={msg.id} className={`flex gap-3 animate-fade-in ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`} style={{ animationDelay: `${i * 0.03}s` }}>
            <div className={`w-8 h-8 rounded flex-shrink-0 flex items-center justify-center text-xs font-semibold ${msg.role === "assistant" ? "bg-[#1a1a1a] border border-white/10" : "bg-red-600 text-white"}`}>
              {msg.role === "assistant"
                ? <img src="https://cdn.poehali.dev/projects/85353fca-ddfd-4c1f-b5b0-734001ac6cf9/bucket/74dd8a8f-7d36-4f03-bf91-a641f9112d81.png" alt="G" className="w-5 h-5 object-contain" />
                : "Вы"}
            </div>
            <div className={`max-w-[75%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`px-4 py-3 rounded text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "assistant" ? "bg-[#1a1a1a] text-white border border-white/10" : "bg-red-600 text-white"}`}>
                {msg.text}
              </div>
              <span className="text-[10px] text-white/30 px-1">{msg.time}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded bg-[#1a1a1a] border border-white/10 flex items-center justify-center">
              <img src="https://cdn.poehali.dev/projects/85353fca-ddfd-4c1f-b5b0-734001ac6cf9/bucket/74dd8a8f-7d36-4f03-bf91-a641f9112d81.png" alt="G" className="w-5 h-5 object-contain" />
            </div>
            <div className="px-4 py-3 rounded bg-[#1a1a1a] border border-white/10 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-typing" style={{ animationDelay: "0s" }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-typing" style={{ animationDelay: "0.2s" }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-typing" style={{ animationDelay: "0.4s" }}></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-white/10 p-4 bg-[#0f0f0f] relative">
        <SuggestionsDropdown show={showSuggestions} suggestions={suggestions} input={input} above={true} suggestRef={suggestRef} onPick={onPickSuggestion} />
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            placeholder="Задайте (RP) Задай свой вопрос..."
            rows={1}
            disabled={loading}
            className="flex-1 resize-none rounded border-2 border-red-700 focus:border-red-500 px-4 py-3 text-sm outline-none transition-colors bg-[#141414] text-white placeholder:text-white/30 disabled:opacity-50 max-h-32"
            style={{ lineHeight: "1.5" }}
            onInput={(e) => { const t = e.currentTarget; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 128) + "px"; }}
          />
          <button
            onClick={() => onSend(input)}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded bg-red-600 text-white flex items-center justify-center hover:bg-red-700 disabled:opacity-40 transition-all flex-shrink-0"
          >
            <Icon name="Send" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
