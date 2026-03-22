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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      text: "Добро пожаловать. Я юридический ИИ-ассистент. Задайте вопрос по документам, регламентам или правовым процедурам — я проконсультирую вас на основе загруженной базы знаний.",
      time: formatTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "docs">("chat");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
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
    <div className="min-h-screen bg-[hsl(210,20%,97%)] flex flex-col" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>

      {/* Header */}
      <header className="bg-[hsl(215,60%,16%)] text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[hsl(42,85%,48%)] flex items-center justify-center">
              <Icon name="Scale" size={18} className="text-[hsl(215,60%,16%)]" />
            </div>
            <div>
              <div className="font-semibold text-base tracking-wide" style={{ fontFamily: "'IBM Plex Serif', serif" }}>
                ЮрКонсул
              </div>
              <div className="text-[10px] text-blue-200 uppercase tracking-widest font-light">
                ИИ-ассистент · Правовые консультации
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
            <span className="text-xs text-blue-200">Онлайн</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-6 flex gap-0 border-t border-blue-900/50">
          {(["chat", "docs"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium tracking-wide transition-all border-b-2 ${
                activeTab === tab
                  ? "border-[hsl(42,85%,48%)] text-white"
                  : "border-transparent text-blue-300 hover:text-white"
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
            {/* Chat */}
            <div className="flex-1 flex flex-col bg-white rounded border border-[hsl(214,20%,88%)] shadow-sm overflow-hidden" style={{ minHeight: "calc(100vh - 200px)" }}>

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
                      msg.role === "assistant"
                        ? "bg-[hsl(215,60%,16%)] text-white"
                        : "bg-[hsl(42,85%,48%)] text-[hsl(215,60%,16%)]"
                    }`}>
                      {msg.role === "assistant" ? <Icon name="Scale" size={14} /> : "Вы"}
                    </div>

                    {/* Bubble */}
                    <div className={`max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      <div className={`px-4 py-3 rounded text-sm leading-relaxed ${
                        msg.role === "assistant"
                          ? "bg-[hsl(210,20%,97%)] text-[hsl(215,35%,10%)] border border-[hsl(214,20%,88%)]"
                          : "bg-[hsl(215,60%,16%)] text-white"
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-[hsl(215,16%,60%)] px-1">{msg.time}</span>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <div className="flex gap-3 animate-fade-in">
                    <div className="w-8 h-8 rounded bg-[hsl(215,60%,16%)] flex items-center justify-center">
                      <Icon name="Scale" size={14} className="text-white" />
                    </div>
                    <div className="px-4 py-3 rounded bg-[hsl(210,20%,97%)] border border-[hsl(214,20%,88%)] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[hsl(215,60%,40%)] animate-typing" style={{ animationDelay: "0s" }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[hsl(215,60%,40%)] animate-typing" style={{ animationDelay: "0.2s" }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[hsl(215,60%,40%)] animate-typing" style={{ animationDelay: "0.4s" }}></span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Suggestions */}
              {messages.length === 1 && (
                <div className="px-6 pb-3 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-xs px-3 py-1.5 rounded border border-[hsl(215,60%,16%)] text-[hsl(215,60%,20%)] hover:bg-[hsl(215,60%,16%)] hover:text-white transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="border-t border-[hsl(214,20%,88%)] p-4 bg-white">
                <div className="flex gap-3 items-end">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Введите правовой вопрос или опишите ситуацию..."
                    rows={1}
                    disabled={loading}
                    className="flex-1 resize-none rounded border border-[hsl(214,20%,88%)] px-4 py-3 text-sm outline-none focus:border-[hsl(215,60%,40%)] transition-colors bg-[hsl(210,20%,98%)] disabled:opacity-50 max-h-32"
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
                    className="w-11 h-11 rounded bg-[hsl(215,60%,16%)] text-white flex items-center justify-center hover:bg-[hsl(215,60%,24%)] disabled:opacity-40 transition-all flex-shrink-0"
                  >
                    <Icon name="Send" size={16} />
                  </button>
                </div>
                <p className="text-[10px] text-[hsl(215,16%,60%)] mt-2">
                  Enter — отправить · Shift+Enter — перенос строки
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 flex flex-col gap-4">
              <div className="bg-white rounded border border-[hsl(214,20%,88%)] shadow-sm p-5">
                <h3 className="text-xs uppercase tracking-widest font-semibold text-[hsl(215,16%,47%)] mb-3">
                  Возможности
                </h3>
                <ul className="space-y-2.5">
                  {[
                    { icon: "FileSearch", text: "Анализ документов" },
                    { icon: "BookOpen", text: "Разъяснение законов" },
                    { icon: "AlertCircle", text: "Правовые риски" },
                    { icon: "ClipboardList", text: "Порядок действий" },
                  ].map((item) => (
                    <li key={item.text} className="flex items-center gap-2.5 text-sm text-[hsl(215,35%,20%)]">
                      <Icon name={item.icon} fallback="Circle" size={14} className="text-[hsl(42,85%,48%)] flex-shrink-0" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[hsl(215,60%,16%)] rounded p-5 text-white">
                <h3 className="text-xs uppercase tracking-widest font-semibold text-blue-300 mb-2">Важно</h3>
                <p className="text-xs text-blue-100 leading-relaxed">
                  Ассистент предоставляет справочную информацию и не заменяет консультацию профессионального юриста.
                </p>
              </div>
            </aside>
          </>
        ) : (
          /* Documents Tab */
          <div className="flex-1">
            <div className="grid gap-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-[hsl(215,35%,10%)]" style={{ fontFamily: "'IBM Plex Serif', serif" }}>
                  База документов
                </h2>
                <span className="text-xs text-[hsl(215,16%,47%)]">{DOCS.length} документа</span>
              </div>
              {DOCS.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded border border-[hsl(214,20%,88%)] shadow-sm p-5 hover:border-[hsl(215,60%,40%)] transition-all cursor-pointer group"
                  onClick={() => {
                    setActiveTab("chat");
                    setInput(`Расскажи подробнее о документе: "${doc.title}"`);
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded bg-[hsl(215,60%,16%)] flex items-center justify-center flex-shrink-0">
                        <Icon name="FileText" size={16} className="text-[hsl(42,85%,48%)]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] uppercase tracking-widest font-semibold text-[hsl(42,85%,45%)] bg-[hsl(42,85%,95%)] px-2 py-0.5 rounded">
                            {doc.tag}
                          </span>
                        </div>
                        <h3 className="font-semibold text-[hsl(215,35%,10%)] text-sm mb-1">{doc.title}</h3>
                        <p className="text-xs text-[hsl(215,16%,47%)]">{doc.excerpt}</p>
                      </div>
                    </div>
                    <Icon name="ChevronRight" size={16} className="text-[hsl(214,20%,70%)] group-hover:text-[hsl(215,60%,40%)] transition-colors flex-shrink-0 mt-1" />
                  </div>
                </div>
              ))}

              <div className="bg-white rounded border border-dashed border-[hsl(214,20%,78%)] p-6 text-center">
                <Icon name="Upload" size={20} className="text-[hsl(215,16%,60%)] mx-auto mb-2" />
                <p className="text-sm text-[hsl(215,16%,47%)]">Добавить документ</p>
                <p className="text-xs text-[hsl(215,16%,65%)] mt-1">PDF, DOCX, TXT</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}