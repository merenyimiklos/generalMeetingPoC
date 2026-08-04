"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import {
  Bell, Building2, CalendarDays, Check, ChevronRight, CircleAlert,
  FileText, Hammer, Home, ImagePlus, Megaphone, Menu, Pencil, Plus,
  Trash2, Users, Vote, Wrench, X,
} from "lucide-react";

type Role = "Lakó" | "Közös képviselő";
type View = "Kezdőlap" | "Hírek" | "Közgyűlés" | "Szavazások" | "Hibák" | "Projektek";
type News = { id: number; title: string; summary: string; body: string; date: string; category: string };
type Issue = { id: number; title: string; category: string; description: string; location: string; priority: string; status: "Bejelentve" | "Folyamatban" | "Elkészült"; date: string };
type Meeting = { id: number; title: string; date: string; time: string; location: string; status: string; agenda: string[]; docs: string[] };
type Poll = { id: number; title: string; description: string; deadline: string; base: Record<string, number> };

const initialNews: News[] = [
  { id: 1, title: "Tavaszi lomtalanítás", summary: "Április 18-án konténert helyezünk ki a hátsó parkolóba.", body: "A konténer péntek reggeltől vasárnap estig használható. Veszélyes hulladékot és elektronikai eszközt kérjük, ne helyezzenek el benne.", date: "2027. április 8.", category: "Közlemény" },
  { id: 2, title: "Karbantartás a mélygarázsban", summary: "Kedden 9 és 13 óra között szünetel a kapu automatikus működése.", body: "A kapumotor éves karbantartása miatt kérjük, hogy ebben az időszakban lehetőség szerint ne használják a mélygarázst.", date: "2027. április 5.", category: "Karbantartás" },
  { id: 3, title: "Megújult a közösségi kert", summary: "Elkészültek az új magaságyások az A épület mellett.", body: "Köszönjük az önkéntesek segítségét! A közös szerszámok a gondnoki helyiségben vehetők át.", date: "2027. március 29.", category: "Közösség" },
];
const initialIssues: Issue[] = [
  { id: 1, title: "Villog a lámpa a 2. emeleten", category: "Világítás", description: "A lift előtti mennyezeti lámpa villog.", location: "A épület, 2. emelet", priority: "Normál", status: "Folyamatban", date: "2027. ápr. 7." },
  { id: 2, title: "Nehezen záródik a bejárati ajtó", category: "Kapu és beléptetés", description: "Az ajtót erősen kell behúzni.", location: "Főbejárat", priority: "Magas", status: "Bejelentve", date: "2027. ápr. 8." },
  { id: 3, title: "Csöpögő csap", category: "Vízvezeték", description: "A csap folyamatosan csöpög.", location: "Földszinti mosdó", priority: "Alacsony", status: "Elkészült", date: "2027. ápr. 2." },
];
const initialMeetings: Meeting[] = [{ id: 1, title: "Éves rendes közgyűlés", date: "2027. május 12.", time: "18:00", location: "Közösségi terem, A épület földszint", status: "Meghirdetve", agenda: ["2026. évi beszámoló elfogadása", "2027. évi költségvetés", "Liftfelújítás kivitelezőjének kiválasztása", "Egyebek"], docs: ["Meghívó és napirend.pdf", "2026. évi pénzügyi beszámoló.pdf", "Liftfelújítási ajánlatok.pdf"] }];
const polls: Poll[] = [
  { id: 1, title: "Kerékpártároló bővítése", description: "Támogatja 12 új kerékpártámasz telepítését a belső udvarban?", deadline: "Lezárás: 2027. április 20.", base: { Igen: 18, Nem: 4, Tartózkodom: 3 } },
  { id: 2, title: "Nyári kertmozi", description: "Legyen három közösségi filmvetítés a nyári hónapokban?", deadline: "Lezárás: 2027. április 25.", base: { Igen: 14, Nem: 2, Tartózkodom: 5 } },
];
const projects = [
  { title: "Napelemtelepítés", description: "Előkészítés a közös terek villamosenergia-igényének csökkentésére.", cost: "18–22 millió Ft", deadline: "2027. IV. negyedév", status: "Tervezett", next: "Műszaki felmérés megrendelése", progress: 22 },
  { title: "Liftfelújítás", description: "A vezérlés, az ajtók és a kabin teljes korszerűsítése.", cost: "14,8 millió Ft", deadline: "2027. szeptember 30.", status: "Döntés előtt", next: "Kivitelező kiválasztása a közgyűlésen", progress: 42 },
  { title: "Homlokzati szigetelés", description: "Energetikai korszerűsítés pályázati támogatás bevonásával.", cost: "65–78 millió Ft", deadline: "2028. II. negyedév", status: "Pályázatfigyelés", next: "Energetikai tanúsítvány frissítése", progress: 12 },
];
const categories = ["Lift", "Világítás", "Vízvezeték", "Fűtés", "Takarítás", "Kapu és beléptetés", "Egyéb"];

function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => { const saved = localStorage.getItem(key); if (saved) { try { setValue(JSON.parse(saved)); } catch {} } setReady(true); }, [key]);
  useEffect(() => { if (ready) localStorage.setItem(key, JSON.stringify(value)); }, [key, ready, value]);
  return [value, setValue] as const;
}

function Badge({ children, tone = "teal" }: { children: ReactNode; tone?: "teal" | "amber" | "blue" | "gray" | "red" }) {
  const colors = { teal: "bg-teal-50 text-teal-800", amber: "bg-amber-50 text-amber-800", blue: "bg-blue-50 text-blue-800", gray: "bg-slate-100 text-slate-700", red: "bg-red-50 text-red-700" };
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${colors[tone]}`}>{children}</span>;
}
function Card({ children, className = "" }: { children: ReactNode; className?: string }) { return <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>{children}</section>; }
function Button({ children, onClick, kind = "primary", type = "button", className = "" }: { children: ReactNode; onClick?: () => void; kind?: "primary" | "secondary" | "danger"; type?: "button" | "submit"; className?: string }) {
  const style = kind === "primary" ? "bg-teal-700 text-white hover:bg-teal-800" : kind === "danger" ? "bg-red-50 text-red-700 hover:bg-red-100" : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50";
  return <button type={type} onClick={onClick} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-bold transition ${style} ${className}`}>{children}</button>;
}
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="grid gap-2 text-sm font-bold text-slate-700">{label}{children}</label>; }
const inputClass = "min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900";

export default function App() {
  const [role, setRole] = useStored<Role>("napfeny-role", "Lakó");
  const [view, setView] = useState<View>("Kezdőlap");
  const [news, setNews] = useStored<News[]>("napfeny-news", initialNews);
  const [issues, setIssues] = useStored<Issue[]>("napfeny-issues", initialIssues);
  const [votes, setVotes] = useStored<Record<number, string>>("napfeny-votes", {});
  const [meetings, setMeetings] = useStored<Meeting[]>("napfeny-meetings", initialMeetings);
  const [rsvp, setRsvp] = useStored<string>("napfeny-rsvp", "Még nem tudom");
  const [moreOpen, setMoreOpen] = useState(false);
  const navigation: { label: View; icon: typeof Home }[] = [
    { label: "Kezdőlap", icon: Home }, { label: "Hírek", icon: Megaphone }, { label: "Közgyűlés", icon: Users },
    { label: "Szavazások", icon: Vote }, { label: "Hibák", icon: Wrench }, { label: "Projektek", icon: Hammer },
  ];
  const go = (next: View) => { setView(next); setMoreOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return <div className="min-h-screen pb-24 lg:pb-0">
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 lg:px-8">
        <button onClick={() => go("Kezdőlap")} className="flex items-center gap-3 text-left">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-700 text-white"><Building2 size={24}/></span>
          <span><strong className="block text-base">Napfény Lakópark</strong><span className="text-xs text-slate-500">A épület · 48 lakás</span></span>
        </button>
        <div className="flex items-center gap-2">
          <button aria-label="Értesítések" className="hidden h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-600 sm:grid"><Bell size={20}/></button>
          <button onClick={() => setRole(role === "Lakó" ? "Közös képviselő" : "Lakó")} className="min-h-11 rounded-xl bg-slate-100 px-3 text-left text-xs font-semibold text-slate-600">
            <span className="block">Szerepkörváltás</span><span className="text-sm font-bold text-teal-800">{role}</span>
          </button>
        </div>
      </div>
    </header>
    <div className="mx-auto flex max-w-7xl">
      <aside className="sticky top-[69px] hidden h-[calc(100vh-69px)] w-64 shrink-0 border-r border-slate-200 bg-white p-4 lg:block">
        <nav className="grid gap-1">{navigation.map(({ label, icon: Icon }) => <button key={label} onClick={() => go(label)} className={`flex min-h-12 items-center gap-3 rounded-xl px-4 text-left font-semibold ${view === label ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-50"}`}><Icon size={20}/>{label}</button>)}</nav>
        <div className="absolute bottom-5 left-4 right-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">2112 Veresegyház<br/>Napfény utca 12.</div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">
        {view === "Kezdőlap" && <Dashboard news={news} issues={issues} go={go}/>} 
        {view === "Hírek" && <NewsPage news={news} setNews={setNews} isManager={role === "Közös képviselő"}/>} 
        {view === "Közgyűlés" && <MeetingsPage meetings={meetings} setMeetings={setMeetings} rsvp={rsvp} setRsvp={setRsvp} isManager={role === "Közös képviselő"}/>} 
        {view === "Szavazások" && <PollsPage votes={votes} setVotes={setVotes}/>} 
        {view === "Hibák" && <IssuesPage issues={issues} setIssues={setIssues} isManager={role === "Közös képviselő"}/>} 
        {view === "Projektek" && <ProjectsPage/>}
      </main>
    </div>
    {moreOpen && <div className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden" onClick={() => setMoreOpen(false)}><div className="absolute bottom-20 left-3 right-3 rounded-2xl bg-white p-3 shadow-xl" onClick={e => e.stopPropagation()}>{(["Szavazások", "Projektek"] as View[]).map(item => <button key={item} onClick={() => go(item)} className="flex min-h-14 w-full items-center justify-between rounded-xl px-4 font-bold"><span>{item}</span><ChevronRight size={20}/></button>)}</div></div>}
    <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 border-t border-slate-200 bg-white px-1 pb-[env(safe-area-inset-bottom)] lg:hidden">
      {[{l:"Kezdőlap" as View,i:Home},{l:"Hírek" as View,i:Megaphone},{l:"Közgyűlés" as View,i:Users},{l:"Hibák" as View,i:Wrench}].map(({l,i:Icon}) => <button key={l} onClick={() => go(l)} className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-bold ${view === l ? "text-teal-700" : "text-slate-500"}`}><Icon size={21}/>{l}</button>)}
      <button onClick={() => setMoreOpen(true)} className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-bold ${["Szavazások","Projektek"].includes(view) ? "text-teal-700" : "text-slate-500"}`}><Menu size={21}/>Továbbiak</button>
    </nav>
  </div>;
}

function PageHead({ eyebrow, title, text, action }: { eyebrow: string; title: string; text: string; action?: ReactNode }) { return <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-1 text-sm font-bold uppercase tracking-wider text-teal-700">{eyebrow}</p><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1><p className="mt-2 max-w-2xl text-slate-600">{text}</p></div>{action}</div>; }

function Dashboard({ news, issues, go }: { news: News[]; issues: Issue[]; go: (v: View) => void }) {
  const stats = [{ label: "Új hírek", value: news.length, icon: Megaphone, view: "Hírek" as View }, { label: "Nyitott hibák", value: issues.filter(i => i.status !== "Elkészült").length, icon: Wrench, view: "Hibák" as View }, { label: "Aktív szavazások", value: 2, icon: Vote, view: "Szavazások" as View }, { label: "Közelgő események", value: 3, icon: CalendarDays, view: "Közgyűlés" as View }];
  return <><PageHead eyebrow="Jó napot kívánunk!" title="Közösségi áttekintés" text="Minden fontos társasházi ügy egy helyen, egyszerűen."/>
    <Card className="mb-5 overflow-hidden border-0 bg-teal-800 text-white shadow-lg"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><Badge tone="amber">Következő közgyűlés</Badge><h2 className="mt-3 text-2xl font-bold">2027. május 12. · 18:00</h2><p className="mt-1 text-teal-100">Közösségi terem, A épület földszint</p></div><Button kind="secondary" onClick={() => go("Közgyűlés")}>Részletek <ChevronRight size={18}/></Button></div></Card>
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{stats.map(({label,value,icon:Icon,view}) => <button key={label} onClick={() => go(view)} className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><span className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-700"><Icon size={21}/></span><strong className="block text-3xl">{value}</strong><span className="text-sm text-slate-600">{label}</span></button>)}</div>
    <div className="mt-6 grid gap-5 xl:grid-cols-2"><Card><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">Legfrissebb hírek</h2><button onClick={() => go("Hírek")} className="font-bold text-teal-700">Összes</button></div><div className="divide-y divide-slate-100">{news.slice(0,3).map(n => <div key={n.id} className="py-3"><Badge>{n.category}</Badge><p className="mt-2 font-bold">{n.title}</p><p className="mt-1 text-sm text-slate-500">{n.date}</p></div>)}</div></Card>
    <Card><h2 className="mb-4 text-lg font-bold">Közelgő időpontok</h2><div className="space-y-3">{[["ÁPR","18","Tavaszi lomtalanítás"],["MÁJ","12","Éves rendes közgyűlés"],["MÁJ","20","Lift éves felülvizsgálata"]].map(x => <div key={x[2]} className="flex items-center gap-4 rounded-xl bg-slate-50 p-3"><div className="w-12 text-center"><span className="block text-[10px] font-bold text-teal-700">{x[0]}</span><strong className="text-xl">{x[1]}</strong></div><span className="font-semibold">{x[2]}</span></div>)}</div></Card></div>
  </>;
}

function NewsPage({ news, setNews, isManager }: { news: News[]; setNews: (n: News[]) => void; isManager: boolean }) {
  const [selected, setSelected] = useState<News | null>(null); const [editing, setEditing] = useState<News | null>(null); const [formOpen, setFormOpen] = useState(false);
  const save = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); const item: News = { id: editing?.id ?? Date.now(), title: String(fd.get("title")), summary: String(fd.get("summary")), body: String(fd.get("body")), category: String(fd.get("category")), date: editing?.date ?? new Intl.DateTimeFormat("hu-HU", { dateStyle: "long" }).format(new Date()) }; setNews(editing ? news.map(n => n.id === item.id ? item : n) : [item, ...news]); setFormOpen(false); setEditing(null); };
  return <><PageHead eyebrow="Közösségi hírek" title="Hírek és közlemények" text="Aktuális információk a ház életéről." action={isManager && <Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus size={18}/>Új hír</Button>}/>
    {news.length === 0 ? <Card className="text-center"><Megaphone className="mx-auto text-slate-400"/><p className="mt-3 font-bold">Még nincs közzétett hír.</p></Card> : <div className="grid gap-4 xl:grid-cols-2">{news.map(n => <Card key={n.id}><div className="flex items-start justify-between gap-3"><Badge>{n.category}</Badge><span className="text-sm text-slate-500">{n.date}</span></div><h2 className="mt-4 text-xl font-bold">{n.title}</h2><p className="mt-2 leading-6 text-slate-600">{n.summary}</p><div className="mt-5 flex flex-wrap gap-2"><Button kind="secondary" onClick={() => setSelected(n)}>Részletek <ChevronRight size={18}/></Button>{isManager && <><Button kind="secondary" onClick={() => { setEditing(n); setFormOpen(true); }}><Pencil size={17}/>Szerkesztés</Button><Button kind="danger" onClick={() => setNews(news.filter(x => x.id !== n.id))}><Trash2 size={17}/><span className="sr-only">Törlés</span></Button></>}</div></Card>)}</div>}
    {selected && <Modal title={selected.title} close={() => setSelected(null)}><Badge>{selected.category}</Badge><p className="mt-4 leading-7 text-slate-700">{selected.body}</p><p className="mt-5 text-sm text-slate-500">Közzétéve: {selected.date}</p></Modal>}
    {formOpen && <Modal title={editing ? "Hír szerkesztése" : "Új hír létrehozása"} close={() => { setFormOpen(false); setEditing(null); }}><form onSubmit={save} className="grid gap-4"><Field label="Cím"><input required name="title" defaultValue={editing?.title} className={inputClass}/></Field><Field label="Kategória"><select name="category" defaultValue={editing?.category ?? "Közlemény"} className={inputClass}><option>Közlemény</option><option>Karbantartás</option><option>Közösség</option></select></Field><Field label="Rövid leírás"><textarea required name="summary" defaultValue={editing?.summary} rows={2} className={inputClass}/></Field><Field label="Teljes szöveg"><textarea required name="body" defaultValue={editing?.body} rows={5} className={inputClass}/></Field><Button type="submit">Mentés</Button></form></Modal>}
  </>;
}

function MeetingsPage({ meetings, setMeetings, rsvp, setRsvp, isManager }: { meetings: Meeting[]; setMeetings: (m: Meeting[]) => void; rsvp: string; setRsvp: (s: string) => void; isManager: boolean }) {
  const [open, setOpen] = useState(false); const meeting = meetings[0];
  const save = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); setMeetings([{ id: Date.now(), title: String(fd.get("title")), date: String(fd.get("date")), time: String(fd.get("time")), location: String(fd.get("location")), status: "Meghirdetve", agenda: String(fd.get("agenda")).split("\n").filter(Boolean), docs: ["Közgyűlési meghívó.pdf"] }, ...meetings]); setOpen(false); };
  return <><PageHead eyebrow="Döntések és egyeztetés" title="Közgyűlések" text="Napirendek, dokumentumok és részvételi visszajelzés." action={isManager && <Button onClick={() => setOpen(true)}><Plus size={18}/>Új közgyűlés</Button>}/>
    {meeting && <Card><div className="flex flex-wrap items-start justify-between gap-3"><div><Badge tone="blue">{meeting.status}</Badge><h2 className="mt-3 text-2xl font-bold">{meeting.title}</h2></div><div className="rounded-xl bg-teal-50 px-4 py-3 text-teal-900"><strong>{meeting.date}</strong><span className="ml-2">{meeting.time}</span></div></div><p className="mt-4 flex items-center gap-2 text-slate-600"><Building2 size={18}/>{meeting.location}</p>
      <div className="mt-7 grid gap-6 xl:grid-cols-2"><div><h3 className="mb-3 font-bold">Napirendi pontok</h3><ol className="space-y-2">{meeting.agenda.map((a,i) => <li key={a} className="flex gap-3 rounded-xl bg-slate-50 p-3"><span className="font-bold text-teal-700">{i+1}.</span><span>{a}</span></li>)}</ol></div><div><h3 className="mb-3 font-bold">Dokumentumok</h3><div className="space-y-2">{meeting.docs.map(d => <div key={d} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"><FileText className="text-teal-700" size={20}/><span className="text-sm font-semibold">{d}</span></div>)}</div></div></div>
      <div className="mt-7 rounded-2xl border border-teal-100 bg-teal-50 p-4"><h3 className="font-bold">Részt vesz a közgyűlésen?</h3><div className="mt-3 flex flex-wrap gap-2">{["Ott leszek","Nem leszek ott","Még nem tudom"].map(x => <button key={x} onClick={() => setRsvp(x)} className={`min-h-11 rounded-xl px-4 font-bold ${rsvp === x ? "bg-teal-700 text-white" : "bg-white text-slate-700"}`}>{rsvp === x && <Check className="mr-1 inline" size={17}/>} {x}</button>)}</div></div>
    </Card>}
    {open && <Modal title="Új közgyűlés" close={() => setOpen(false)}><form onSubmit={save} className="grid gap-4"><Field label="Megnevezés"><input required name="title" className={inputClass}/></Field><div className="grid grid-cols-2 gap-3"><Field label="Dátum"><input required name="date" placeholder="2027. június 10." className={inputClass}/></Field><Field label="Időpont"><input required name="time" type="time" className={inputClass}/></Field></div><Field label="Helyszín"><input required name="location" className={inputClass}/></Field><Field label="Napirendi pontok (soronként egy)"><textarea required name="agenda" rows={5} className={inputClass}/></Field><Button type="submit">Közgyűlés létrehozása</Button></form></Modal>}
  </>;
}

function PollsPage({ votes, setVotes }: { votes: Record<number, string>; setVotes: (v: Record<number, string>) => void }) {
  return <><PageHead eyebrow="Közösségi vélemény" title="Szavazások" text="Mondja el véleményét az aktuális kérdésekben."/><div className="mb-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900"><CircleAlert className="mt-0.5 shrink-0" size={22}/><strong>Ez egy demonstrációs szavazás, nem minősül hivatalos társasházi szavazásnak.</strong></div>
    <div className="grid gap-4 xl:grid-cols-2">{polls.map(p => { const picked = votes[p.id]; const counts = { ...p.base }; if (picked) counts[picked] = (counts[picked] ?? 0) + 1; const total = Object.values(counts).reduce((a,b) => a+b,0); return <Card key={p.id}><Badge tone="teal">Aktív</Badge><h2 className="mt-3 text-xl font-bold">{p.title}</h2><p className="mt-2 min-h-12 text-slate-600">{p.description}</p><p className="mt-3 text-sm font-semibold text-slate-500">{p.deadline}</p>{!picked ? <div className="mt-5 grid grid-cols-3 gap-2">{["Igen","Nem","Tartózkodom"].map(x => <button key={x} onClick={() => setVotes({...votes,[p.id]:x})} className="min-h-12 rounded-xl border border-slate-300 px-2 text-sm font-bold hover:border-teal-600 hover:bg-teal-50">{x}</button>)}</div> : <div className="mt-5"><p className="mb-4 flex items-center gap-2 font-bold text-teal-800"><Check size={19}/>Az Ön válasza: {picked}</p>{Object.entries(counts).map(([k,v]) => <div key={k} className="mb-3"><div className="mb-1 flex justify-between text-sm"><span>{k}</span><strong>{Math.round(v/total*100)}%</strong></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-600" style={{width:`${v/total*100}%`}}/></div></div>)}</div>}</Card>; })}</div>
  </>;
}

function IssuesPage({ issues, setIssues, isManager }: { issues: Issue[]; setIssues: (i: Issue[]) => void; isManager: boolean }) {
  const [open, setOpen] = useState(false); const [filter, setFilter] = useState("Mind");
  const shown = useMemo(() => filter === "Mind" ? issues : issues.filter(i => i.status === filter), [filter, issues]);
  const save = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); setIssues([{ id: Date.now(), title: String(fd.get("title")), category: String(fd.get("category")), description: String(fd.get("description")), location: String(fd.get("location")), priority: String(fd.get("priority")), status: "Bejelentve", date: "Ma" }, ...issues]); setOpen(false); };
  const update = (id: number, status: Issue["status"]) => setIssues(issues.map(i => i.id === id ? {...i,status} : i));
  return <><PageHead eyebrow="Segítünk megoldani" title="Hibabejelentések" text="Jelezze egyszerűen a közös területeken észlelt problémát." action={<Button onClick={() => setOpen(true)}><Plus size={18}/>Új hibabejelentés</Button>}/>
    <div className="mb-4 flex gap-2 overflow-auto pb-1">{["Mind","Bejelentve","Folyamatban","Elkészült"].map(x => <button key={x} onClick={() => setFilter(x)} className={`min-h-10 whitespace-nowrap rounded-full px-4 text-sm font-bold ${filter === x ? "bg-slate-800 text-white" : "bg-white text-slate-600"}`}>{x}</button>)}</div>
    {shown.length === 0 ? <Card className="text-center"><Check className="mx-auto text-teal-600"/><p className="mt-3 font-bold">Nincs ilyen státuszú hibabejelentés.</p></Card> : <div className="grid gap-4 xl:grid-cols-2">{shown.map(i => <Card key={i.id}><div className="flex items-start justify-between gap-2"><Badge tone={i.status === "Elkészült" ? "teal" : i.status === "Folyamatban" ? "blue" : "amber"}>{i.status}</Badge><span className="text-sm text-slate-500">{i.date}</span></div><h2 className="mt-3 text-lg font-bold">{i.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{i.description}</p><div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600"><span className="rounded-lg bg-slate-100 px-2 py-1">{i.category}</span><span className="rounded-lg bg-slate-100 px-2 py-1">{i.location}</span><span className="rounded-lg bg-slate-100 px-2 py-1">{i.priority} prioritás</span></div>{isManager && <Field label="Státusz módosítása"><select value={i.status} onChange={e => update(i.id, e.target.value as Issue["status"])} className={`${inputClass} mt-4`}><option>Bejelentve</option><option>Folyamatban</option><option>Elkészült</option></select></Field>}</Card>)}</div>}
    {open && <Modal title="Új hibabejelentés" close={() => setOpen(false)}><form onSubmit={save} className="grid gap-4"><Field label="Cím"><input required name="title" className={inputClass}/></Field><Field label="Kategória"><select name="category" className={inputClass}>{categories.map(c => <option key={c}>{c}</option>)}</select></Field><Field label="Leírás"><textarea required name="description" rows={4} className={inputClass}/></Field><Field label="Helyszín"><input required name="location" placeholder="pl. A épület, 3. emelet" className={inputClass}/></Field><Field label="Prioritás"><select name="priority" className={inputClass}><option>Alacsony</option><option>Normál</option><option>Magas</option></select></Field><button type="button" className="flex min-h-24 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 text-sm font-bold text-slate-500"><ImagePlus size={22}/>Fénykép hozzáadása (demó)</button><Button type="submit">Hibabejelentés elküldése</Button></form></Modal>}
  </>;
}

function ProjectsPage() { return <><PageHead eyebrow="Fejlesztések" title="Pályázatok és projektek" text="A Napfény Lakópark tervezett és folyamatban lévő beruházásai."/><div className="grid gap-4 xl:grid-cols-2">{projects.map(p => <Card key={p.title}><div className="flex items-start justify-between gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-700"><Hammer size={22}/></span><Badge tone="blue">{p.status}</Badge></div><h2 className="mt-4 text-xl font-bold">{p.title}</h2><p className="mt-2 leading-6 text-slate-600">{p.description}</p><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-slate-50 p-3"><span className="block text-xs text-slate-500">Becsült költség</span><strong className="text-sm">{p.cost}</strong></div><div className="rounded-xl bg-slate-50 p-3"><span className="block text-xs text-slate-500">Határidő</span><strong className="text-sm">{p.deadline}</strong></div></div><div className="mt-5"><div className="mb-2 flex justify-between text-sm"><span className="font-semibold">Előkészítés</span><strong>{p.progress}%</strong></div><div className="h-2.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-600" style={{width:`${p.progress}%`}}/></div></div><div className="mt-5 rounded-xl border border-teal-100 bg-teal-50 p-3"><span className="text-xs font-bold uppercase text-teal-700">Következő lépés</span><p className="mt-1 font-semibold text-teal-950">{p.next}</p></div></Card>)}</div></>; }

function Modal({ title, children, close }: { title: string; children: ReactNode; close: () => void }) { return <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/45 p-3 sm:p-6" onMouseDown={close}><div className="mx-auto mt-4 max-w-xl rounded-2xl bg-white p-5 shadow-2xl sm:mt-12 sm:p-6" onMouseDown={e => e.stopPropagation()}><div className="mb-5 flex items-start justify-between gap-4"><h2 className="text-xl font-bold">{title}</h2><button onClick={close} aria-label="Bezárás" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100"><X size={20}/></button></div>{children}</div></div>; }
