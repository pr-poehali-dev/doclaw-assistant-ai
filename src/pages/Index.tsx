import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Message, Doc, DOCS, formatTime, searchDocs } from "@/data/docs";
import Sidebar from "@/components/chat/Sidebar";
import ChatView from "@/components/chat/ChatView";
import DocsView from "@/components/chat/DocsView";

export default function Index() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "docs">("chat");
  const [started, setStarted] = useState(false);
  const [suggestions, setSuggestions] = useState<Doc[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const suggestRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!started) inputRef.current?.focus();
  }, [started]);

  useEffect(() => {
    const results = searchDocs(input);
    setSuggestions(results);
    setShowSuggestions(results.length > 0 && input.trim().length >= 2);
  }, [input]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (suggestRef.current && !suggestRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function getLocalAnswer(query: string): string {
    const matches = searchDocs(query);
    if (matches.length === 0) return "По вашему вопросу информация в базе регламентов не найдена. Уточните запрос или обратитесь к командованию.";
    const doc = matches[0];
    const lines = doc.points.map(p => `${p.num}${p.severity ? " " + p.severity : ""} ${p.text}`).join("\n");
    return `**${doc.title}**\n\n${lines}`;
  }

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    if (!started) setStarted(true);
    setShowSuggestions(false);

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: text.trim(), time: formatTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const relevantDocs = searchDocs(text.trim());
    const docsToSend = (relevantDocs.length > 0 ? relevantDocs : DOCS).map(d => ({
      title: d.title,
      content: d.points.map(p => `${p.num}${p.severity ? " " + p.severity : ""} ${p.text}`).join("\n"),
    }));

    try {
      const res = await fetch("https://functions.poehali.dev/765ed3ba-a58f-4d33-bee6-a35cc1ed691f", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.map(m => ({ role: m.role, content: m.text })),
          docs: docsToSend,
        }),
      });
      const data = await res.json();
      const reply = data.reply || getLocalAnswer(text.trim());
      setMessages((prev) => [...prev, { id: Date.now().toString() + "a", role: "assistant", text: reply, time: formatTime() }]);
    } catch {
      const localReply = getLocalAnswer(text.trim());
      setMessages((prev) => [...prev, { id: Date.now().toString() + "e", role: "assistant", text: localReply, time: formatTime() }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
    if (e.key === "Escape") setShowSuggestions(false);
  }

  function pickSuggestion(doc: Doc) {
    setShowSuggestions(false);
    sendMessage(doc.title);
  }

  function handleDocClick(title: string) {
    setActiveTab("chat");
    sendMessage(title);
  }

  return (
    <div className="min-h-screen bg-black flex flex-col text-white" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>

      {/* Header */}
      <header className="bg-[#0f0f0f] border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://cdn.poehali.dev/projects/85353fca-ddfd-4c1f-b5b0-734001ac6cf9/bucket/74dd8a8f-7d36-4f03-bf91-a641f9112d81.png" alt="Guard" className="w-10 h-10 object-contain" />
            <div className="font-semibold text-base tracking-wide text-white" style={{ fontFamily: "'IBM Plex Serif', serif" }}>
              Помощник Guard
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
            <span className="text-xs text-white/50">Онлайн</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 flex gap-0 border-t border-white/10">
          {(["chat", "docs"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium tracking-wide transition-all border-b-2 ${activeTab === tab ? "border-red-500 text-white" : "border-transparent text-white/40 hover:text-white"}`}>
              {tab === "chat"
                ? <span className="flex items-center gap-2"><Icon name="MessageSquare" size={14} />Консультация</span>
                : <span className="flex items-center gap-2"><Icon name="FileText" size={14} />Документы ({DOCS.length})</span>}
            </button>
          ))}
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 max-w-7xl w-full mx-auto">

        <Sidebar />

        <main className="flex-1 flex flex-col px-4 py-6 gap-6 min-w-0">
          {activeTab === "chat" ? (
            <ChatView
              messages={messages}
              input={input}
              loading={loading}
              started={started}
              suggestions={suggestions}
              showSuggestions={showSuggestions}
              inputRef={inputRef}
              bottomRef={bottomRef}
              suggestRef={suggestRef}
              onInputChange={setInput}
              onKeyDown={handleKey}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onSend={sendMessage}
              onPickSuggestion={pickSuggestion}
            />
          ) : (
            <DocsView onDocClick={handleDocClick} />
          )}
        </main>
      </div>
    </div>
  );
}