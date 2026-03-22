import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
}

interface Doc {
  id: string;
  title: string;
  tag: string;
  content: string;
}

const DOCS: Doc[] = [
  {
    id: "1",
    title: "Порядок задержания бойца регулярного формирования или наёмников",
    tag: "Регламент",
    content: "Подойти к клону, четко назвать причину задержания без каких-либо сокращений. Попросить бойца встать к стене и поднять руки вверх.\n\nВ случае выполнения требований: обыскать и изъять вооружение (датападом), средства связи и инструменты; надеть наручники.\n\nВ случае неадекватного поведения, попытки побега, ухода от ответственности, отказа от выполнения требований: снять оружие с предохранителя и произвести выстрел в оглушающем режиме; заломать руки за спину и надеть наручники; обыскать и изъять вооружение, средства связи и инструменты.\n\nПровести задерживаемого в КПЗ/на место выполнения ДВ/СКТ (ТК, ИВС). ТК или Цитадель обязательно нужно занимать перед началом прохождения.\n\nЕсли это проступок: спрашиваем «Вы желаете получить сроки в КПЗ или ДВ/СКТ?». Самостоятельно мы не имеем право выдавать сроки без отказа от СКТ или рецидива.\n\nЕсли это преступление: ПЕРЕД ВЫДАЧЕЙ наказания уведомляем старшего по должности/званию того формирования, чей боец был задержан, о наказании, количестве сроков и бойце.",
  },
  {
    id: "2",
    title: "Порядок задержания БСО бойцом Корусантской гвардии",
    tag: "Регламент",
    content: "Подойти к клону, четко назвать причину задержания без каких-либо сокращений. Попросить бойца встать к стене и поднять руки вверх.\n\nВ случае выполнения требований: обыскать и изъять вооружение (датападом) и инструменты; надеть наручники. СРЕДСТВА СВЯЗИ МЫ НЕ ИЗЫМАЕМ НЕ В КОЕМ СЛУЧАЕ ИЗ-ЗА СЕКРЕТНОСТИ.\n\nВ случае неадекватного поведения: снять оружие с предохранителя и произвести выстрел в оглушающем режиме; заломать руки за спину и надеть наручники; обыскать и изъять вооружение и инструменты.\n\nПровести задерживаемого в КПЗ/на место выполнения ДВ/СКТ (ТК, ИВС).\n\nВызываем COD (9-ый батальон) и просим их изъять средства связи. Время реагирования — 5 минут. Если не приходят — пишем трибунал или пишем Yoda.\n\nЕсли это проступок: спрашиваем «Вы желаете получить сроки в КПЗ или ДВ/СКТ?». Самостоятельно мы не имеем право выдавать сроки без отказа от СКТ или рецидива.\n\nЕсли это преступление: ПЕРЕД ВЫДАЧЕЙ наказания уведомляем всё БСО о наказании, количестве сроков и бойце.",
  },
  {
    id: "3",
    title: "Порядок задержания 9-ого батальона бойцом Корусантской гвардии",
    tag: "Регламент",
    content: "Если вы увидели нарушение проступков: никакие санкции в сторону 9-ого батальона гвардия вносить не имеет право. Пишем запрос в «заявка-сроки» с упоминанием Главы Департамента/SEC|CO/Директор SOB/ПА.\n\nЕсли вы увидели преступление: подойти к клону, четко назвать причину задержания. Попросить бойца встать к стене и поднять руки вверх.\n\nВ случае выполнения требований: обыскать и изъять вооружение (датападом) и инструменты; надеть наручники. СРЕДСТВА СВЯЗИ НЕ ИЗЫМАЕМ ИЗ-ЗА СЕКРЕТНОСТИ.\n\nВ случае неадекватного поведения: снять оружие с предохранителя и произвести выстрел в оглушающем режиме; заломать руки и надеть наручники; обыскать и изъять вооружение и инструменты.\n\nПровести задерживаемого в КПЗ в ИВС. Вызываем COD и просим изъять средства связи. Время реагирования — 5 минут. Если не приходят — пишем трибунал или Yoda.\n\nПЕРЕД ВЫДАЧЕЙ наказания уведомляем всё БСО о наказании, количестве сроков и бойце.",
  },
  {
    id: "4",
    title: "Порядок задержания ордена Джедаев бойцом Корусантской гвардии",
    tag: "Регламент",
    content: "Если на ОВО присутствует член Совета Джедаев/Тень: вызываете члена Совета Джедаев/Тень для выдачи наказания внутри структуры ордена, предоставляя доказательства нарушения.\n\nЕсли на ОВО отсутствует член Совета Джедаев/Тень: подойти к джедаю, четко назвать причину задержания. Попросить встать к стене и поднять руки вверх.\n\nВ случае выполнения требований: обыскать и изъять вооружение (датападом), средства связи и инструменты; надеть наручники.\n\nВ случае неадекватного поведения: снять оружие с предохранителя и произвести выстрел в оглушающем режиме; заломать руки и надеть наручники; обыскать и изъять вооружение, средства связи и инструменты.\n\nПровести задерживаемого в КПЗ/на место выполнения ДВ/СКТ (ТК, ИВС).\n\nЕсли это проступок: спрашиваем «Вы желаете получить сроки в КПЗ или ДВ/СКТ?».\n\nЕсли это преступление: уведомляем Джедаев о наказании; выдаём 3 срока в ИВС и подаём запрос в «заявка-сроки», если нет разрешения от ВК. Если разрешение присутствует — выдаём полноценное наказание.",
  },
  {
    id: "5",
    title: "Порядок задержания высшего командования бойцом Корусантской гвардии",
    tag: "Регламент",
    content: "Задержание или какие-либо действия в сторону Высшего командования только в соответствии с прямым вызовом на трибунал.",
  },
];

const SUGGESTIONS = [
  "Каков порядок задержания бойца?",
  "Что делать при отказе выполнять требования?",
  "Как оформить рапорт о задержании?",
];

function formatTime() {
  return new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function searchDocs(query: string): Doc[] {
  if (!query.trim() || query.trim().length < 2) return [];
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length >= 2);
  return DOCS.filter(doc => {
    const haystack = (doc.title + " " + doc.tag + " " + doc.content).toLowerCase();
    return words.some(word => haystack.includes(word));
  }).slice(0, 5);
}

function highlightMatch(text: string, query: string) {
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length >= 2);
  if (!words.length) return text;
  const regex = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-red-600/30 text-red-300 rounded px-0.5">{part}</mark>
      : part
  );
}

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

  // Поиск по документам при вводе
  useEffect(() => {
    const results = searchDocs(input);
    setSuggestions(results);
    setShowSuggestions(results.length > 0 && input.trim().length >= 2);
  }, [input]);

  // Закрытие подсказок при клике вне
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
    if (matches.length === 0) return "По вашему вопросу информация в базе документов не найдена. Уточните запрос или обратитесь к командованию.";
    const doc = matches[0];
    return `**${doc.title}**\n\n${doc.content}`;
  }

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    if (!started) setStarted(true);
    setShowSuggestions(false);

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: text.trim(), time: formatTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Находим релевантные документы и передаём их в запрос
    const relevantDocs = searchDocs(text.trim()).length > 0
      ? searchDocs(text.trim()).map(d => ({ title: d.title, content: d.content }))
      : DOCS.map(d => ({ title: d.title, content: d.content }));

    try {
      const res = await fetch("https://functions.poehali.dev/765ed3ba-a58f-4d33-bee6-a35cc1ed691f", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.map(m => ({ role: m.role, content: m.text })),
          docs: relevantDocs,
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

  // Компонент выпадающего списка подсказок
  function SuggestionsDropdown({ above = false }: { above?: boolean }) {
    if (!showSuggestions) return null;
    return (
      <div
        ref={suggestRef}
        className={`absolute left-0 right-0 z-50 bg-[#1a1a1a] border border-white/15 rounded-lg shadow-2xl overflow-hidden ${above ? "bottom-full mb-2" : "top-full mt-2"}`}
      >
        <div className="px-3 py-2 border-b border-white/10">
          <span className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Найдено в документах</span>
        </div>
        {suggestions.map((doc) => (
          <button
            key={doc.id}
            onMouseDown={() => pickSuggestion(doc)}
            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left group"
          >
            <div className="w-7 h-7 rounded bg-red-950/60 border border-red-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon name="FileText" size={12} className="text-red-400" />
            </div>
            <div className="min-w-0">
              <div className="text-sm text-white font-medium truncate">
                {highlightMatch(doc.title, input)}
              </div>
              <div className="text-xs text-white/40 truncate mt-0.5">
                {highlightMatch(doc.content.slice(0, 80), input)}
              </div>
            </div>
            <Icon name="ArrowUpLeft" size={13} className="text-white/20 group-hover:text-red-400 flex-shrink-0 mt-1 transition-colors" />
          </button>
        ))}
      </div>
    );
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

                {/* Быстрые вопросы */}
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

                {/* Поле ввода по центру с автодополнением */}
                <div className="w-full max-w-xl relative">
                  <SuggestionsDropdown above={false} />
                  <div className="flex gap-3 items-end bg-[#141414] rounded-lg border-2 border-red-600 shadow-md px-4 py-3">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKey}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
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
                      <div className={`w-8 h-8 rounded flex-shrink-0 flex items-center justify-center text-xs font-semibold ${
                        msg.role === "assistant" ? "bg-[#1a1a1a] border border-white/10" : "bg-red-600 text-white"
                      }`}>
                        {msg.role === "assistant"
                          ? <img src="https://cdn.poehali.dev/projects/85353fca-ddfd-4c1f-b5b0-734001ac6cf9/bucket/74dd8a8f-7d36-4f03-bf91-a641f9112d81.png" alt="G" className="w-5 h-5 object-contain" />
                          : "Вы"}
                      </div>

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

                {/* Input в чате с автодополнением */}
                <div className="border-t border-white/10 p-4 bg-[#0f0f0f] relative">
                  <SuggestionsDropdown above={true} />
                  <div className="flex gap-3 items-end">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKey}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                      placeholder="Задайте (RP) Задай свой вопрос..."
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
                <span className="text-xs text-white/40">{DOCS.length} документов</span>
              </div>

              {DOCS.length === 0 && (
                <div className="bg-[#0f0f0f] rounded border border-white/10 p-10 text-center">
                  <Icon name="FileX" size={28} className="text-white/20 mx-auto mb-3" />
                  <p className="text-sm text-white/40">Документы ещё не добавлены</p>
                  <p className="text-xs text-white/25 mt-1">Загрузите документы, чтобы нейронка искала по ним</p>
                </div>
              )}

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
                        <span className="text-[10px] uppercase tracking-widest font-semibold text-red-500 bg-red-950/50 px-2 py-0.5 rounded">
                          {doc.tag}
                        </span>
                        <h3 className="font-semibold text-white text-sm mb-1 mt-1">{doc.title}</h3>
                        <p className="text-xs text-white/40">{doc.content.slice(0, 100)}</p>
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