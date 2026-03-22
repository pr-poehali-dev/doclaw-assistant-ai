import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
}

interface DocPoint {
  num: string;   // "(1)." — пункт
  severity?: string; // 🟢🔵 и т.д.
  text: string;
}

interface Doc {
  id: string;
  title: string;
  abbr: string;   // ЗП, ВЭ, РНО...
  tag: string;
  severity: string; // отображаемые эмодзи категорий
  points: DocPoint[];
  rawContent: string; // для поиска
}

// ─── БАЗА ДОКУМЕНТОВ ──────────────────────────────────────────────
const DOCS: Doc[] = [
  {
    id: "1",
    title: "Порядок задержания бойца регулярного формирования или наёмников",
    abbr: "ПЗБ",
    tag: "Задержание",
    severity: "",
    rawContent: "задержание боец регулярное формирование наёмник обыск наручники КПЗ ДВ СКТ ИВС проступок преступление",
    points: [
      { num: "1.", text: "Подойти к клону, чётко назвать причину задержания без сокращений. Попросить встать к стене и поднять руки вверх." },
      { num: "2.", text: "При выполнении требований: обыскать и изъять вооружение (датападом), средства связи и инструменты; надеть наручники." },
      { num: "3.", text: "При неадекватном поведении / попытке побега: снять оружие с предохранителя, выстрел в оглушающем режиме, заломать руки, наручники, обыск." },
      { num: "4.", text: "Провести в КПЗ/ДВ/СКТ (ТК, ИВС). ТК или Цитадель занимать перед началом прохождения." },
      { num: "5.", text: "Проступок: спрашиваем «Вы желаете получить сроки в КПЗ или ДВ/СКТ?». Самостоятельно сроки без отказа от СКТ или рецидива не выдаём." },
      { num: "6.", text: "Преступление: ДО выдачи наказания уведомляем старшего по должности/званию формирования, чей боец задержан." },
    ],
  },
  {
    id: "2",
    title: "Порядок задержания БСО бойцом Корусантской гвардии",
    abbr: "ПЗБСО",
    tag: "Задержание",
    severity: "",
    rawContent: "задержание БСО секретность средства связи COD 9 батальон трибунал Yoda наручники КПЗ",
    points: [
      { num: "1.", text: "Подойти к клону, чётко назвать причину задержания без сокращений. Попросить встать к стене и поднять руки вверх." },
      { num: "2.", text: "При выполнении требований: обыскать и изъять вооружение (датападом) и инструменты; надеть наручники. СРЕДСТВА СВЯЗИ НЕ ИЗЫМАЕМ — СЕКРЕТНОСТЬ." },
      { num: "3.", text: "При неадекватном поведении: выстрел в оглушающем режиме, заломать руки, наручники, обыск. Средства связи не трогать." },
      { num: "4.", text: "Провести в КПЗ/ДВ/СКТ (ТК, ИВС)." },
      { num: "5.", text: "Вызвать COD (9-й батальон) для изъятия средств связи. Время реагирования — 5 минут. Не пришли — трибунал или Yoda." },
      { num: "6.", text: "Проступок: спрашиваем «Вы желаете получить сроки в КПЗ или ДВ/СКТ?»." },
      { num: "7.", text: "Преступление: ДО выдачи наказания уведомляем всё БСО о наказании, количестве сроков и бойце." },
    ],
  },
  {
    id: "3",
    title: "Порядок задержания 9-ого батальона бойцом Корусантской гвардии",
    abbr: "ПЗ9Б",
    tag: "Задержание",
    severity: "",
    rawContent: "задержание 9 батальон COD проступок преступление заявка сроки трибунал Yoda БСО ИВС секретность",
    points: [
      { num: "1.", text: "При нарушении проступков: санкции гвардия вносить не имеет права. Пишем запрос в «заявка-сроки» с упоминанием Главы Департамента/SEC|CO/Директор SOB/ПА." },
      { num: "2.", text: "При преступлении: подойти к клону, чётко назвать причину задержания, встать к стене, руки вверх." },
      { num: "3.", text: "При выполнении требований: обыскать, изъять вооружение и инструменты. СРЕДСТВА СВЯЗИ — НЕ ИЗЫМАТЬ." },
      { num: "4.", text: "При неадекватном поведении: выстрел в оглушающем режиме, наручники, обыск без средств связи." },
      { num: "5.", text: "Провести в КПЗ/ИВС. Вызвать COD для изъятия средств связи (5 минут). Не пришли — трибунал или Yoda." },
      { num: "6.", text: "ДО выдачи наказания уведомляем всё БСО о наказании, количестве сроков и бойце." },
    ],
  },
  {
    id: "4",
    title: "Порядок задержания ордена Джедаев бойцом Корусантской гвардии",
    abbr: "ПЗДж",
    tag: "Задержание",
    severity: "",
    rawContent: "задержание джедай орден совет тень ОВО наручники КПЗ ИВС ВК заявка сроки трибунал",
    points: [
      { num: "1.", text: "Если на ОВО есть член Совета Джедаев/Тень — вызвать его для выдачи наказания внутри структуры, предоставив доказательства." },
      { num: "2.", text: "Если члена Совета/Тени нет — подойти, назвать причину, попросить встать к стене, руки вверх." },
      { num: "3.", text: "При выполнении требований: обыскать, изъять вооружение, средства связи и инструменты; надеть наручники." },
      { num: "4.", text: "При неадекватном поведении: выстрел в оглушающем режиме, заломать руки, наручники, обыск." },
      { num: "5.", text: "Провести в КПЗ/ДВ/СКТ (ТК, ИВС)." },
      { num: "6.", text: "Проступок: спрашиваем «Вы желаете получить сроки в КПЗ или ДВ/СКТ?»." },
      { num: "7.", text: "Преступление: уведомить Джедаев; 3 срока в ИВС + запрос в «заявка-сроки» без разрешения ВК. При наличии разрешения — полноценное наказание." },
    ],
  },
  {
    id: "5",
    title: "Порядок задержания высшего командования бойцом Корусантской гвардии",
    abbr: "ПЗВК",
    tag: "Задержание",
    severity: "",
    rawContent: "задержание высшее командование трибунал",
    points: [
      { num: "1.", text: "Задержание или любые действия в сторону Высшего командования — только по прямому вызову на трибунал." },
    ],
  },
  {
    id: "6",
    title: "Золотые правила",
    abbr: "ЗП",
    tag: "Устав",
    severity: "🔵 / ⚫ / 🟡",
    rawContent: "золотые правила союзник увечья оружие приказ звание должность субординация дисциплина лексикон этикет регламент ношение",
    points: [
      { num: "(1).", severity: "⚫", text: "Не наносить увечья по союзникам (искл: прямая угроза жизни; успокоение нарушителя устава — только LT+, Гвардия, Ударный клон)." },
      { num: "", severity: "🟡", text: "В малозначимых ситуациях (единоразовое оглушение/тренировочное вооружение) — проступок 3 категории." },
      { num: "(2).", severity: "⚫", text: "Исполнять приказы старших по званию/должности. Подчинение: в первую очередь формирование, во вторую — специализация. В экстренных ситуациях (угроза жизни, медики, инженеры) — специализация в приоритете." },
      { num: "", severity: "🔵", text: "В малозначимых ситуациях — проступок 2 категории." },
      { num: "(3).", severity: "🔵", text: "Соблюдать регламент ношения оружия." },
      { num: "(4).", severity: "🔵", text: "Не нарушать субординацию и дисциплину: воинский лексикон, этикет, поведение перед старшими, пример для младших." },
    ],
  },
  {
    id: "7",
    title: "Воинский этикет/лексикон",
    abbr: "ВЭ",
    tag: "Устав",
    severity: "🟢",
    rawContent: "воинский этикет приветствие казарма старший звание разрешение субординация обращение вы тон стойка",
    points: [
      { num: "(1).", text: "Исполнять воинское приветствие старшим по званию (искл: Джедаи — поклон, наёмники — Sucuy'gar)." },
      { num: "(2).", text: "При входе в казарму — спросить разрешение (искл: Гвардия с ордером/при задержании, Высшее командование)." },
      { num: "(3).", text: "Не перебивать старшего по званию, не делать замечаний, не влезать в разговор без обращения к вам." },
      { num: "(4).", text: "Обращаться на «Вы» к старшему по званию, не повышать тон, говорить вежливо. Стойка смирно, лицом к лицу." },
    ],
  },
  {
    id: "8",
    title: "Воинский лексикон",
    abbr: "ВЛ",
    tag: "Устав",
    severity: "🟢",
    rawContent: "лексикон да нет не знаю можно извините хорошо спасибо так точно никак нет есть виноват благодарю разрешите",
    points: [
      { num: "(1).", text: "Да → Так точно" },
      { num: "(2).", text: "Нет → Никак нет" },
      { num: "(3).", text: "Не знаю → Не могу знать" },
      { num: "(4).", text: "Можно → Разрешите" },
      { num: "(5).", text: "Извините → Виноват, исправлюсь" },
      { num: "(6).", text: "Хорошо → Есть" },
      { num: "(7).", text: "Спасибо → Благодарю" },
    ],
  },
  {
    id: "9",
    title: "Правила поведения в строю",
    abbr: "ППвС",
    tag: "Устав",
    severity: "🟢",
    rawContent: "строй разрешение стоять двигаться поворот разговор звук приветствие командир",
    points: [
      { num: "(1).", text: "Без разрешения руководящего строем или старшего по званию нельзя вставать в строй и выходить из него." },
      { num: "(2).", text: "Запрещено двигаться и поворачивать головой." },
      { num: "(3).", text: "Запрещено разговаривать и издавать звуки." },
      { num: "(4).", text: "Запрещено исполнять воинское приветствие." },
    ],
  },
  {
    id: "10",
    title: "Регламент ношения оружия",
    abbr: "РНО",
    tag: "Устав",
    severity: "🔵",
    rawContent: "оружие ношение зелёный жёлтый красный чёрный код предохранитель DC-17 рядовой арсенал взрывоопасный запрещено",
    points: [
      { num: "(1).", text: "Зелёный код: только DC-17 для CPL+. Рукоятки мечей — запрет. Исключения: Командиры+, Гвардия, ВК, Ghost (ЗС/конвой), Ударный клон (казарма/конвой), БСО." },
      { num: "(2).", text: "Рядовым запрещено брать оружие без сопровождения CPL+." },
      { num: "(3).", text: "Жёлтый/Красный/Чёрный код: оружие в руках на предохранителе. Снимать только по приказу или при угрозе жизни." },
      { num: "(4).", text: "Патрулирование, пост, вылет/выход/разведка — оружие на предохранителе. Тренировки — по приказу уполномоченного лица." },
      { num: "(5).", text: "По приказу командования формирования (командир, заместители) и выше." },
      { num: "(6).", text: "Зелёный код на ОВО: запрещено взрывоопасное, огнеопасное, РПС, Z-6, огнемёты, гранаты (искл: тренировка/обучение/вход-выход)." },
      { num: "(7).", text: "PVT/PV1 не имеют права на вооружение вне регламентированных случаев." },
    ],
  },
  {
    id: "11",
    title: "Обязанности и права всех единиц ВАР",
    abbr: "ОиПВЕВ",
    tag: "Устав",
    severity: "🟢 / 🔵 / 🔴 / ⚫",
    rawContent: "обязанности права единица ВАР устав республика командир звание гвардия конфиденциальность красный код агитация тренировка провокация шлем чрезвычайная",
    points: [
      { num: "(1).", severity: "🟢", text: "Строго соблюдать устав ВАР и все дополнительные документы." },
      { num: "(2).", severity: "🟢", text: "Защищать интересы Республики, не наносить вреда единицам ВАР. Совершенствовать навыки, поднимать боевой дух." },
      { num: "(3).", severity: "🔴", text: "Выполнять все приказы старших без обсуждения. Если приказ противоречит Уставу — не исполнять и доложить Гвардии/ВК." },
      { num: "(4).", severity: "🟢", text: "Знать должности, звания, внешний вид командиров и представителей ВК." },
      { num: "(5).", severity: "🔴", text: "Предоставлять достоверные сведения Гвардии, 9-му батальону, ВК и командованию формирования. Обман и сокрытие запрещены." },
      { num: "(6).", severity: "🔴", text: "Хранить конфиденциальность секретной информации ВАР." },
      { num: "(7).", severity: "🔵", text: "При красном коде — встать на защиту объекта, занять посты, ждать приказа." },
      { num: "(8).", severity: "🟢", text: "При красном/жёлтом коде — вход/выход без запроса при уведомлении командования ОВО и формирования." },
      { num: "(9).", severity: "🟢", text: "Не проявлять агрессии к мирным гражданским." },
      { num: "(10).", severity: "🔵", text: "Содействовать Гвардии, 9-му батальону БСО, Ударным клонам своего формирования, не препятствовать их работе." },
      { num: "(11).", severity: "🔴", text: "Не содействовать, не игнорировать и не скрывать нарушения любой единицы ВАР, служащих по контракту, Джедаев." },
      { num: "(12).", severity: "🟢", text: "Не использовать уязвимости Устава в личных целях." },
      { num: "(13).", severity: "🔵", text: "Бережно относиться к имуществу Республики." },
      { num: "(14).", severity: "🟢", text: "Своевременно обновлять личное дело. Не нарушать совместимость специализаций." },
      { num: "(15).", severity: "🟢", text: "Отсутствие более 1 месяца без отпуска или 6 месяцев с отпуском — обязательное переобучение в кадетском корпусе." },
      { num: "(16).", severity: "⚫", text: "Запрещена чёрная агитация: рассказы о подразделениях, составе, преимуществах и недостатках без инициативы самого бойца." },
      { num: "(17).", severity: "🔵", text: "Организатор тренировки обязан занять территорию и уведомить ОВО/ВО о характере тренировки (техника, взрывы, выстрелы)." },
      { num: "(18).", severity: "🔵", text: "Запрещено провоцировать военнослужащих/гражданских на нарушения или конфликты, участвовать в межлегионных спорах." },
      { num: "(19).", severity: "🔵", text: "При ЧС, посту, охране, боевых вылетах и кодах реагирования — обязателен шлем." },
      { num: "Права (1).", text: "Право уволиться или перевестись, уведомив командование (после 5 дней службы в формировании)." },
      { num: "Права (2).", text: "Применять оружие для отражения нападения, пресечения захвата оружия/техники, защиты жизни." },
      { num: "Права (3).", text: "Выражать негодование, благодарности, жалобы после выполнения задачи в корректной форме." },
      { num: "Права (4).", text: "Право на обучение, медпомощь и саморазвитие в свободное время." },
    ],
  },
  {
    id: "12",
    title: "Постовая служба",
    abbr: "ПС",
    tag: "Устав",
    severity: "🔵",
    rawContent: "пост постовой служба документы сканер шлем CPL SGT формирование безопасность пропуск IDN чип код",
    points: [
      { num: "0.", text: "Поставить на пост может клон формирования CPL+, а также ВК. На посту 1-4 клона PVT+. SGT+ вправе заступить самостоятельно, уведомив по рации." },
      { num: "(1).", text: "Держать основное оружие на предохранителе в оглушающем режиме, быть в шлеме." },
      { num: "(2).", text: "Не пропускать неуполномоченных лиц (например: рекруты без CPL+)." },
      { num: "(3).", text: "Не покидать пост и не заступать без уведомления/приказа (искл: PVT CT Formation)." },
      { num: "(4).", text: "При пропуске — проверить документацию (чип или IDN-карта) и попросить снять шлем." },
      { num: "(5).", text: "Если единица отказывается предъявить документы или снять шлем — приказать остановиться. При неподчинении — выстрел в оглушающем режиме, вызов Гвардии." },
      { num: "(6).", text: "Если ВК нельзя распознать — вправе потребовать снять шлем и предъявить документы." },
      { num: "(7).", text: "Проверка по кодам: Зелёный — шлем + документы. Жёлтый — шлем + документы. Красный — шлем (если нет угрозы). Чёрный — проход свободный." },
    ],
  },
  {
    id: "13",
    title: "Правила арсенала",
    abbr: "ПА",
    tag: "Устав",
    severity: "🔵",
    rawContent: "арсенал постовой шлем документы CPL оружие проверка высшее командование",
    points: [
      { num: "(1).", text: "Проход в арсенал — с разрешения постового. Снять шлем и предъявить документы (в красный/чёрный код — только шлем)." },
      { num: "(2).", text: "Перед заступлением на пост в арсенал — пройти такую же проверку." },
      { num: "(3).", text: "ВК не обязаны проходить проверку, если их можно распознать." },
      { num: "(4).", text: "Оружие брать из арсенала только согласно РНО и только в сопровождении CPL+." },
    ],
  },
  {
    id: "14",
    title: "Правила поведения на военном объекте",
    abbr: "ППнВО",
    tag: "Устав",
    severity: "🟢 / 🔵",
    rawContent: "военный объект запрещено действие причина техника оружие брань угроза медикамент граната стрельбище строй двери укрепление спать бар казарма рекрут проникновение алкоголь музыка",
    points: [
      { num: "(1).", severity: "🟢", text: "Запрещены необоснованные действия без причины или приказа (покидать объект, прыгать, вставать в пост, брать технику без квалификации и т.д.)." },
      { num: "(2).", severity: "🟢", text: "Чрезмерная ненормативная лексика или угрозы в сторону братьев и союзников (старшие могут использовать в воспитательном ключе)." },
      { num: "(3).", severity: "🟢", text: "Запрещено использовать спецсредства, медпрепараты и мединструменты на объекте вне экстренных случаев при Зелёном/Жёлтом коде. Сюда входят: гранаты, джетпаки, реактивные ботинки, обмундирование Джаггернаута, крюк-кошка." },
      { num: "(4).", severity: "🟢", text: "Запрещено входить в зал симуляции/стрельбище без CPL+ и без оповещения." },
      { num: "(5).", severity: "🟢", text: "Запрещено блокировать двери, ворота и входы без приказа." },
      { num: "(6).", severity: "🟢", text: "Запрещено возводить укрепления (искл: жёлтый/красный код, приказ Army, инженерные работы)." },
      { num: "(7).", severity: "🟢", text: "Запрещено следить за кем-либо и подслушивать (искл: Guard, Army)." },
      { num: "(8).", severity: "🟢", text: "Запрещено спать/уходить в себя вне разрешённых мест (бар, казарма, реабилитационный медблок)." },
      { num: "(9).", severity: "🟢", text: "Кадету/рекруту запрещено покидать кадетскую без CPL+." },
      { num: "(10).", severity: "🟡", text: "Запрещено проникать на территорию с ограниченным доступом без разрешения." },
      { num: "(11).", severity: "🔵", text: "Запрещено иметь/курить табак, употреблять алкоголь или наркотики (искл: медицинские препараты по назначению)." },
      { num: "(12).", severity: "🟢", text: "Запрещено петь/танцевать/слушать музыку (искл: казарма, бар при зелёном коде, если не мешаете)." },
    ],
  },
  {
    id: "15",
    title: "Правила военных объектов",
    abbr: "ПВО",
    tag: "Устав",
    severity: "🔵",
    rawContent: "военный объект посторонний контракт разрешение постовой диспетчер проход оружие сканер запрос формуляр техника выход вход пешком CPL джедай наёмник",
    points: [
      { num: "(1).", text: "Запрещено находиться на объектах ВАР лицам не из ВАР без контракта или разрешения." },
      { num: "(2).", text: "Разрешение дают: ВК в звании CPT+, старший по ВО (если нет вышестоящего), Guard WO1+ (если нет вышестоящего). Выдача должна быть обоснована." },
      { num: "(3).", text: "Разрешение действует единожды — для следующего посещения нужно новое (искл: контракт)." },
      { num: "(4).", text: "Лица без контракта сдают всё оружие на время нахождения на базе." },
      { num: "(5).", text: "Лица с разрешением не допускаются к терминалам, консолям, аккламатору, закрытому сектору." },
      { num: "(6).", text: "При наличии постороннего — обыск и изъятие опасных средств и записывающих устройств (искл: приказ ВК)." },
      { num: "(7).", text: "Лицам с разрешением на базе — оружие запрещено (искл: условия контракта)." },
      { num: "(8).", text: "Запрещено нахождение посторонних в карцере, медблоке, закрытом секторе (искл: брифинг/задержание/содействие Guard/9 батальону/медпомощь под надзором)." },
      { num: "(9).", text: "Прибывшие обязаны ознакомиться с правилами объекта и соблюдать их." },
      { num: "(10).", text: "Любая единица ВАР обязана подать запрос перед входом/выходом по установленному формуляру." },
      { num: "(11).", text: "Проход через объект — только с разрешения постового/диспетчера. Если их нет — по запросу." },
      { num: "(12).", text: "При проникновении без разрешения — формирование, отвечающее за ВО, вправе произвести задержание и доложить Гвардии." },
      { num: "(13).", text: "Армия может въезжать/выходить без запроса, просто уведомив любой ВО." },
      { num: "(14).", text: "Выход за пределы ВО — только с CPL+ (искл: Джедаи/взвод наёмников)." },
      { num: "(15).", text: "Выход с ОВО пешим ходом — минимум 2 солдата (искл: Джедаи, наёмники, SOB, Army)." },
      { num: "(16).", text: "Джедаи и наёмники в запросе указывают имя и фамилию вместо IDN." },
      { num: "(17).", text: "При КК все формирования вне базы обязаны немедленно вернуться на ВО." },
      { num: "(18).", text: "Выход с ОВО/ВО — только при соблюдении регламента выхода." },
    ],
  },
  {
    id: "16",
    title: "Техника безопасности",
    abbr: "ТБ",
    tag: "Устав",
    severity: "🔵",
    rawContent: "техника безопасность крыша оружие предохранитель патруль пост линия огня техника взлётная площадка транспорт аварийная",
    points: [
      { num: "(1).", text: "Запрещено находиться на крышах (искл: красный код, инженерные работы, посты, приказ командования). Также — на краях объектов и ограждений." },
      { num: "(2).", text: "Оружие всегда на предохранителе при зелёном/жёлтом коде. Щёлкать предохранителем запрещено." },
      { num: "(3).", text: "Запрещено выходить на патруль/пост без уведомления по рации (искл: красный код)." },
      { num: "(4).", text: "Запрещено находиться в зоне линии огня при стрельбе в боевом режиме." },
      { num: "(5).", text: "Запрещено находиться на взлётной площадке при движении воздушного транспорта; запрещено стоять ближе 2 метров и на линии движения наземного транспорта." },
      { num: "(6).", text: "Водитель воздушного транспорта обязан предупредить и ждать освобождения площадки. Наземный — соблюдать 2 метра, ждать при невозможности." },
      { num: "(7).", text: "Запрещено создавать аварийную ситуацию при управлении техникой." },
    ],
  },
  {
    id: "17",
    title: "Пороги дефектности",
    abbr: "ПД",
    tag: "Устав",
    severity: "",
    rawContent: "дефект порог клон лечение переобучение расстрел агрессия приказ оружие доказательства трибунал кадетская",
    points: [
      { num: "1.", text: "1 порог — клон не дефективен, слабые отклонения. Получает наказание при нарушении устава." },
      { num: "2.", text: "2 порог — определённая дефектность, не опасная. Лечение + наказание при нарушении. Выявляется дефектологом." },
      { num: "3.", text: "3 порог — дефектность, опасная для окружающих. Лечение + переобучение в кадетской." },
      { num: "4.", text: "4 порог — неизлечимая дефектность с агрессией. Расстрел. Выявляется при одновременном совпадении: (1) клон не слушает приказы, (2) только агрессивное поведение, (3) выстрелил боевыми в своего (или неоднократно шоковыми). При наличии 3+ свидетелей ВАР с доказательствами — расстрел на месте. Без доказательств — трибунал." },
    ],
  },
  {
    id: "18",
    title: "Система дисциплинарных взысканий",
    abbr: "СДВ",
    tag: "Устав",
    severity: "🟢 / 🔵 / 🟡 / 🔴 / ⚫",
    rawContent: "дисциплина взыскание проступок преступление срок КПЗ ДВ СКТ ИВС трибунал обслуживающий персонал лексикон этикет строй гвардия",
    points: [
      { num: "🟢", text: "Проступки 1 категории (1 срок КПЗ или ДВ): нарушение военного лексикона, воинского этикета, правил в строю, ОиПВЕВ пп.1,2,4,8,9,12,14,15, правил ППнВО пп.1,2,3,4,5,6,7,8,9,12." },
      { num: "🔵", text: "Проступки 2 категории (2 срока КПЗ или СКТ): нарушение ЗП пп.3,4, ОиПВЕВ пп.7,10,13,17,18,19, регламента ношения оружия, помеха постовой службе, нарушение ПА, ППнВО п.11, ПВО, ТБ." },
      { num: "🟡", text: "Проступки 3 категории (3 срока КПЗ или СКТ): нарушение ППнВО п.10." },
      { num: "🔴", text: "Преступления средней тяжести (3-4 срока/трибунал): нарушение ОиПВЕВ пп.3,5,6,11, халатное отношение к должностным обязанностям (при наличии тяжких последствий)." },
      { num: "⚫", text: "Тяжкие преступления (5-6 сроков/трибунал): нарушение ЗП пп.1,2, ОиПВЕВ п.16, нарушение системы повышений (выговор + заморозка набора/перевода 3-14 дней), нанесение тяжких увечий и убийство." },
      { num: "Прим.", text: "За одно очевидное нарушение — одно наказание. Гвардия не уполномочена инкриминировать преступления средней и тяжкой категории, но обязана задержать и поместить в ИВС до 3 сроков, направив прошение ВК с доказательной базой. 1 срок КПЗ = 15 минут. СКТ — специальная карательная тренировка." },
    ],
  },
];

// ─── АББРЕВИАТУРА ───────────────────────────────────────────────
const LEGEND = [
  { icon: "🟢", label: "Проступки 1 категории", note: "Предупреждение/ДВ, при отказе — 1 срок" },
  { icon: "🔵", label: "Проступки 2 категории", note: "Предупреждение/СКТ, при отказе — 2 срока" },
  { icon: "🟡", label: "Проступки 3 категории", note: "3 срока/СКТ" },
  { icon: "🔴", label: "Преступления средней тяжести", note: "3-4 срока/Трибунал" },
  { icon: "⚫", label: "Тяжкие преступления", note: "5-6 сроков/Трибунал" },
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
  const scored = DOCS.map(doc => {
    const haystack = (doc.title + " " + doc.abbr + " " + doc.tag + " " + doc.rawContent + " " + doc.points.map(p => p.text).join(" ")).toLowerCase();
    const score = words.reduce((s, w) => s + (haystack.includes(w) ? 1 : 0), 0);
    return { doc, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);
  return scored.slice(0, 5).map(x => x.doc);
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
  const [legendOpen, setLegendOpen] = useState(true);
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

  function SuggestionsDropdown({ above = false }: { above?: boolean }) {
    if (!showSuggestions) return null;
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
            onMouseDown={() => pickSuggestion(doc)}
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

        {/* LEFT SIDEBAR — Аббревиатура */}
        <aside className="w-64 flex-shrink-0 border-r border-white/10 bg-[#0a0a0a] p-4 flex flex-col gap-3">
          <button
            onClick={() => setLegendOpen(v => !v)}
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

          {/* Краткий список аббревиатур */}
          <div className="mt-2">
            <div className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-2">Документы</div>
            <div className="flex flex-col gap-1">
              {DOCS.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => { setActiveTab("chat"); sendMessage(`Расскажи про регламент: ${doc.title}`); }}
                  className="text-left text-[10px] text-white/40 hover:text-red-400 transition-colors px-1 py-0.5 rounded hover:bg-white/5 truncate"
                  title={doc.title}
                >
                  [{doc.abbr}] {doc.title}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 flex flex-col px-4 py-6 gap-6 min-w-0">

          {activeTab === "chat" ? (
            <>
              {!started ? (
                <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
                  <img src="https://cdn.poehali.dev/projects/85353fca-ddfd-4c1f-b5b0-734001ac6cf9/bucket/74dd8a8f-7d36-4f03-bf91-a641f9112d81.png" alt="Guard" className="w-20 h-20 object-contain mb-6 opacity-90" />
                  <h1 className="text-2xl font-semibold text-white mb-2" style={{ fontFamily: "'IBM Plex Serif', serif" }}>Помощник Guard</h1>
                  <p className="text-sm text-white/50 mb-10 text-center max-w-sm">Задайте вопрос по документам, регламентам или правовым процедурам</p>

                  <div className="flex flex-wrap gap-2 justify-center mb-8 max-w-xl">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} onClick={() => sendMessage(s)}
                        className="text-xs px-4 py-2 rounded-full border border-red-600 text-red-400 hover:bg-red-600 hover:text-white transition-all">
                        {s}
                      </button>
                    ))}
                  </div>

                  <div className="w-full max-w-xl relative">
                    <SuggestionsDropdown above={false} />
                    <div className="flex gap-3 items-end bg-[#141414] rounded-lg border-2 border-red-600 shadow-md px-4 py-3">
                      <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey}
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        placeholder="Введите ваш вопрос..." rows={1}
                        className="flex-1 resize-none text-sm outline-none bg-transparent max-h-32 text-white placeholder:text-white/30"
                        style={{ lineHeight: "1.6" }}
                        onInput={(e) => { const t = e.currentTarget; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 128) + "px"; }} />
                      <button onClick={() => sendMessage(input)} disabled={!input.trim()}
                        className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 disabled:opacity-30 transition-all flex-shrink-0">
                        <Icon name="Send" size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
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
                    <SuggestionsDropdown above={true} />
                    <div className="flex gap-3 items-end">
                      <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey}
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        placeholder="Задайте (RP) Задай свой вопрос..." rows={1} disabled={loading}
                        className="flex-1 resize-none rounded border-2 border-red-700 focus:border-red-500 px-4 py-3 text-sm outline-none transition-colors bg-[#141414] text-white placeholder:text-white/30 disabled:opacity-50 max-h-32"
                        style={{ lineHeight: "1.5" }}
                        onInput={(e) => { const t = e.currentTarget; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 128) + "px"; }} />
                      <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
                        className="w-11 h-11 rounded bg-red-600 text-white flex items-center justify-center hover:bg-red-700 disabled:opacity-40 transition-all flex-shrink-0">
                        <Icon name="Send" size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1">
              <div className="grid gap-3">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-lg font-semibold text-white" style={{ fontFamily: "'IBM Plex Serif', serif" }}>База регламентов</h2>
                  <span className="text-xs text-white/40">{DOCS.length} документов</span>
                </div>
                {DOCS.map((doc) => (
                  <div key={doc.id} className="bg-[#0f0f0f] rounded border border-white/10 shadow-sm hover:border-red-600 transition-all cursor-pointer group"
                    onClick={() => { setActiveTab("chat"); sendMessage(`Расскажи подробно про: ${doc.title}`); }}>
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
                    {/* Первые 2 пункта */}
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
          )}
        </main>
      </div>
    </div>
  );
}
