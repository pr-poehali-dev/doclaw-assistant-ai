import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
}

const DOCS = [
  {
    id: "1",
    title: "Порядок задержания бойца",
    tag: "Регламент",
    excerpt: "Задержание бойца регулярного формирования или наёмника",
  },
  {
    id: "2",
    title: "Задержание высшего командования",
    tag: "Регламент",
    excerpt: "Только по прямому вызову на трибунал",
  },
];

const SUGGESTIONS = [
  "Каков порядок задержания бойца?",
  "Что делать при отказе выполнять требования?",
  "Как оформить рапорт о задержании?",
  "Какие права есть у задерживаемого?",
];

function formatTime() {
  return new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export default function Index() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "docs">("chat");
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!started) inputRef.current?.focus();
  }, [started]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    if (!started) setStarted(true);

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: text.trim(), time: formatTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://functions.poehali.dev/765ed3ba-a58f-4d33-bee6-a35cc1ed691f", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), history: messages.map(m => ({ role: m.role, content: m.text })) }),
      });
      const data = await res.json();
      const reply = data.reply || "Произошла ошибка. Попробуйте ещё раз.";
      setMessages((prev) => [...prev, { id: Date.now().toString() + "a", role: "assistant", text: reply, time: formatTime() }]);
    } catch {
      setMessages((prev) => [...prev, { id: Date.now().toString() + "e", role: "assistant", text: "Сервер недоступен. Попробуйте позже.", time: formatTime() }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col text-white" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>

      {/* Header */}
      <header className="bg-[#0f0f0f] border-b border-white/10 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://cdn.poehali.dev/projects/85353fca-ddfd-4c1f-b5b0-734001ac6cf9/bucket/74dd8a8f-7d36-4f03-bf91-a641f9112d81.png"
              alt="Guard"
              className="w-10 h-10 object-contain"
            />
            <div className="font-semibold text-base tracking-wide text-white" style={{ fontFamily: "'IBM Plex Serif', serif" }}>
              Помощник Guard
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
            <span className="text-xs text-white/50">Онлайн</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-6 flex gap-0 border-t border-white/10">
          {(["chat", "docs"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium tracking-wide transition-all border-b-2 ${
                activeTab === tab
                  ? "border-red-500 text-white"
                  : "border-transparent text-white/40 hover:text-white"
              }`}
            >
              {tab === "chat" ? (
                <span className="flex items-center gap-2"><Icon name="MessageSquare" size={14} />Консультация</span>
              ) : (
                <span className="flex items-center gap-2"><Icon name="FileText" size={14} />Документы</span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 flex gap-6">

        {activeTab === "chat" ? (
          <>
            {!started ? (
              /* Стартовый экран по центру */
              <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
                <img
                  src="https://cdn.poehali.dev/projects/85353fca-ddfd-4c1f-b5b0-734001ac6cf9/bucket/74dd8a8f-7d36-4f03-bf91-a641f9112d81.png"
                  alt="Guard"
                  className="w-20 h-20 object-contain mb-6 opacity-90"
                />
                <h1 className="text-2xl font-semibold text-white mb-2" style={{ fontFamily: "'IBM Plex Serif', serif" }}>
                  Помощник Guard
                </h1>
                <p className="text-sm text-white/50 mb-10 text-center max-w-sm">
                  Задайте вопрос по документам, регламентам или правовым процедурам
                </p>

                {/* Подсказки */}
                <div className="flex flex-wrap gap-2 justify-center mb-8 max-w-xl">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-xs px-4 py-2 rounded-full border border-red-600 text-red-400 hover:bg-red-600 hover:text-white transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Поле ввода по центру */}
                <div className="w-full max-w-xl">
                  <div className="flex gap-3 items-end bg-[#141414] rounded-lg border-2 border-red-600 shadow-md px-4 py-3">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKey}
                      placeholder="Введите ваш вопрос..."
                      rows={1}
                      className="flex-1 resize-none text-sm outline-none bg-transparent max-h-32 text-white placeholder:text-white/30"
                      style={{ lineHeight: "1.6" }}
                      onInput={(e) => {
                        const t = e.currentTarget;
                        t.style.height = "auto";
                        t.style.height = Math.min(t.scrollHeight, 128) + "px";
                      }}
                    />
                    <button
                      onClick={() => sendMessage(input)}
                      disabled={!input.trim()}
                      className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 disabled:opacity-30 transition-all flex-shrink-0"
                    >
                      <Icon name="Send" size={15} />
                    </button>
                  </div>
                  <p className="text-[10px] text-white/30 mt-2 text-center">
                    Enter — отправить · Shift+Enter — перенос строки
                  </p>
                </div>
              </div>
            ) : (
              /* Режим чата */
              <div className="flex-1 flex flex-col bg-[#0f0f0f] rounded border border-white/10 shadow-sm overflow-hidden animate-fade-in" style={{ minHeight: "calc(100vh - 200px)" }}>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5 chat-scrollbar">
                  {messages.map((msg, i) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 animate-fade-in ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                      style={{ animationDelay: `${i * 0.03}s` }}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded flex-shrink-0 flex items-center justify-center text-xs font-semibold ${
                        msg.role === "assistant" ? "bg-[#1a1a1a] border border-white/10" : "bg-red-600 text-white"
                      }`}>
                        {msg.role === "assistant"
                          ? <img src="https://cdn.poehali.dev/projects/85353fca-ddfd-4c1f-b5b0-734001ac6cf9/bucket/74dd8a8f-7d36-4f03-bf91-a641f9112d81.png" alt="G" className="w-5 h-5 object-contain" />
                          : "Вы"}
                      </div>

                      {/* Bubble */}
                      <div className={`max-w-[75%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                        <div className={`px-4 py-3 rounded text-sm leading-relaxed ${
                          msg.role === "assistant"
                            ? "bg-[#1a1a1a] text-white border border-white/10"
                            : "bg-red-600 text-white"
                        }`}>
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-white/30 px-1">{msg.time}</span>
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
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

                {/* Input в чате */}
                <div className="border-t border-white/10 p-4 bg-[#0f0f0f]">
                  <div className="flex gap-3 items-end">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKey}
                      placeholder="Введите следующий вопрос..."
                      rows={1}
                      disabled={loading}
                      className="flex-1 resize-none rounded border-2 border-red-700 focus:border-red-500 px-4 py-3 text-sm outline-none transition-colors bg-[#141414] text-white placeholder:text-white/30 disabled:opacity-50 max-h-32"
                      style={{ lineHeight: "1.5" }}
                      onInput={(e) => {
                        const t = e.currentTarget;
                        t.style.height = "auto";
                        t.style.height = Math.min(t.scrollHeight, 128) + "px";
                      }}
                    />
                    <button
                      onClick={() => sendMessage(input)}
                      disabled={!input.trim() || loading}
                      className="w-11 h-11 rounded bg-red-600 text-white flex items-center justify-center hover:bg-red-700 disabled:opacity-40 transition-all flex-shrink-0"
                    >
                      <Icon name="Send" size={16} />
                    </button>
                  </div>
                  <p className="text-[10px] text-white/30 mt-2">
                    Enter — отправить · Shift+Enter — перенос строки
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Documents Tab */
          <div className="flex-1">
            <div className="grid gap-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-white" style={{ fontFamily: "'IBM Plex Serif', serif" }}>
                  База документов
                </h2>
                <span className="text-xs text-white/40">{DOCS.length} документа</span>
              </div>
              {DOCS.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-[#0f0f0f] rounded border border-white/10 shadow-sm p-5 hover:border-red-600 transition-all cursor-pointer group"
                  onClick={() => {
                    setActiveTab("chat");
                    sendMessage(`Расскажи подробнее о документе: "${doc.title}"`);
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded bg-[#1a1a1a] border border-white/10 flex items-center justify-center flex-shrink-0">
                        <Icon name="FileText" size={16} className="text-red-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] uppercase tracking-widest font-semibold text-red-500 bg-red-950/50 px-2 py-0.5 rounded">
                            {doc.tag}
                          </span>
                        </div>
                        <h3 className="font-semibold text-white text-sm mb-1">{doc.title}</h3>
                        <p className="text-xs text-white/40">{doc.excerpt}</p>
                      </div>
                    </div>
                    <Icon name="ChevronRight" size={16} className="text-white/20 group-hover:text-red-500 transition-colors flex-shrink-0 mt-1" />
                  </div>
                </div>
              ))}

              <div className="bg-[#0f0f0f] rounded border border-dashed border-white/15 p-6 text-center">
                <Icon name="Upload" size={20} className="text-white/30 mx-auto mb-2" />
                <p className="text-sm text-white/40">Добавить документ</p>
                <p className="text-xs text-white/25 mt-1">PDF, DOCX, TXT</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
