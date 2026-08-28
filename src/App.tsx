import { useMemo, useState, type ReactNode } from 'react';
import { seedStore, TICKER, todayISO, type Store, type Tab } from './lib';
import {
  BoxIcon,
  ClipboardIcon,
  CoinsIcon,
  CowIcon,
  DropIcon,
  GridIcon,
  ResetIcon,
  SproutIcon,
  SunCloudIcon,
  WheatIcon,
  WindIcon,
} from './icons';
import { ToastProvider, useLocalStorage, useNow, useToast } from './ui';
import Dashboard from './sections/Dashboard';
import Crops from './sections/Crops';
import Livestock from './sections/Livestock';
import Tasks from './sections/Tasks';
import Inventory from './sections/Inventory';
import Finance from './sections/Finance';

const TABS: { id: Tab; label: string; icon: (c: string) => ReactNode }[] = [
  { id: 'ringkasan', label: 'Ringkasan', icon: (c) => <GridIcon className={c} /> },
  { id: 'tanaman', label: 'Tanaman', icon: (c) => <WheatIcon className={c} /> },
  { id: 'ternak', label: 'Ternak', icon: (c) => <CowIcon className={c} /> },
  { id: 'agenda', label: 'Agenda', icon: (c) => <ClipboardIcon className={c} /> },
  { id: 'gudang', label: 'Gudang', icon: (c) => <BoxIcon className={c} /> },
  { id: 'keuangan', label: 'Keuangan', icon: (c) => <CoinsIcon className={c} /> },
];

const TEMP_BY_HOUR = [24, 24, 23, 23, 23, 24, 25, 26, 27, 28, 29, 30, 31, 31, 31, 30, 29, 28, 27, 26, 25, 25, 24, 24];

function Ticker() {
  return (
    <div className="flex items-stretch overflow-hidden border-y border-moss-800 bg-moss-950 text-paper">
      <div className="z-10 flex shrink-0 items-center bg-hay-500 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-moss-950 sm:px-4 sm:text-[11px]">
        Harga Pasaran
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap py-1.5 pl-8 text-xs">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="font-bold">{t.name}</span>
              <span className="text-paper/60">{t.price}</span>
              <span className={`font-extrabold ${t.up ? 'text-leaf-300' : 'text-clay-300'}`}>{t.up ? '▲' : '▼'} {t.pct}</span>
              <span className="text-paper/25">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Shell() {
  const toast = useToast();
  const [raw, setStore] = useLocalStorage<Store>('tanipadu:v2', seedStore);
  const [tab, setTab] = useState<Tab>('ringkasan');
  const now = useNow(1000);

  const store: Store = useMemo(
    () => ({
      crops: Array.isArray(raw?.crops) ? raw.crops : seedStore.crops,
      animals: Array.isArray(raw?.animals) ? raw.animals : seedStore.animals,
      tasks: Array.isArray(raw?.tasks) ? raw.tasks : seedStore.tasks,
      inv: Array.isArray(raw?.inv) ? raw.inv : seedStore.inv,
      ledger: Array.isArray(raw?.ledger) ? raw.ledger : seedStore.ledger,
    }),
    [raw]
  );

  const today = todayISO();
  const openToday = store.tasks.filter((t) => !t.done && t.date === today).length;
  const lowStock = store.inv.filter((i) => i.stock <= i.min).length;
  const badges: Partial<Record<Tab, number>> = { agenda: openToday, gudang: lowStock };

  const h = now.getHours();
  const greet = h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18.5 ? 'Selamat sore' : 'Selamat malam';
  const temp = TEMP_BY_HOUR[h];
  const humidity = Math.max(58, 94 - (temp - 23) * 4);
  const wind = 6 + ((h * 7) % 9);
  const cond = temp >= 30 ? 'Cerah terik' : temp >= 27 ? 'Cerah berawan' : 'Berawan ringan';

  const dateLong = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const start = new Date(now.getFullYear(), 0, 0);
  const week = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  const clock = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const navBtn = (t: (typeof TABS)[number], mobile: boolean) => {
    const active = tab === t.id;
    const badge = badges[t.id];
    if (mobile)
      return (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
            active ? 'bg-leaf-500 text-moss-950' : 'bg-moss-800 text-paper/70 hover:text-paper'
          }`}
        >
          {t.icon('h-3.5 w-3.5')}
          {t.label}
          {badge ? <span className={`rounded-full px-1.5 text-[10px] font-extrabold ${active ? 'bg-moss-950 text-leaf-300' : 'bg-hay-500 text-moss-950'}`}>{badge}</span> : null}
        </button>
      );
    return (
      <button
        key={t.id}
        onClick={() => setTab(t.id)}
        className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-all ${
          active ? 'bg-moss-800 text-leaf-300' : 'text-paper/60 hover:bg-moss-900 hover:text-paper'
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full transition-all ${active ? 'bg-leaf-400' : 'bg-transparent group-hover:bg-paper/30'}`} />
        {t.icon('h-4.5 w-4.5')}
        {t.label}
        {badge ? (
          <span className="ml-auto rounded-full bg-hay-500 px-2 py-0.5 text-[10px] font-extrabold text-moss-950">{badge}</span>
        ) : null}
      </button>
    );
  };

  return (
    <div className="min-h-screen">
      {/* ===== Sidebar desktop ===== */}
      <aside className="furrow fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-moss-800 bg-moss-950 px-4 py-6 lg:flex">
        <div className="mb-8 flex items-center gap-3 px-1">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-500 text-moss-950 shadow-lg shadow-leaf-500/20">
            <SproutIcon className="h-5.5 w-5.5" />
          </span>
          <div>
            <p className="font-display text-xl font-extrabold leading-none tracking-tight text-paper">TaniPadu</p>
            <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.22em] text-paper/40">Pertanian Terpadu</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">{TABS.map((t) => navBtn(t, false))}</nav>

        <div className="space-y-3">
          <div className="flex items-center gap-2.5 rounded-xl bg-moss-800/70 p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-leaf-500 font-display text-sm font-extrabold text-moss-950">D</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-paper">Pak Darmawan</p>
              <p className="truncate text-[11px] text-paper/50">Poktan Makmur · Sukamaju</p>
            </div>
          </div>
          <button
            onClick={() => {
              setStore(seedStore);
              toast('Data demo dimuat ulang');
            }}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-moss-800 py-2 text-[11px] font-bold text-paper/45 transition-colors hover:border-moss-700 hover:text-paper"
          >
            <ResetIcon className="h-3.5 w-3.5" /> Muat ulang data demo
          </button>
        </div>
      </aside>

      {/* ===== Topbar mobile ===== */}
      <div className="furrow sticky top-0 z-40 border-b border-moss-800 bg-moss-950 lg:hidden">
        <div className="flex items-center gap-2.5 px-4 pt-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-leaf-500 text-moss-950">
            <SproutIcon className="h-4.5 w-4.5" />
          </span>
          <p className="font-display text-lg font-extrabold tracking-tight text-paper">TaniPadu</p>
          <span className="ml-auto text-[11px] font-bold tabular-nums text-paper/60">{clock}</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto px-4 py-2.5 [scrollbar-width:none]">{TABS.map((t) => navBtn(t, true))}</div>
      </div>

      {/* ===== Konten ===== */}
      <main className="lg:pl-60">
        <div className="mx-auto max-w-[1240px] px-4 pt-6 sm:px-6 lg:px-8 lg:pt-8">
          <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div className="animate-rise">
              <p className="mb-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-leaf-700">
                {dateLong} · Kemarau I · Pekan ke-{week}
              </p>
              <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{greet}, Pak Darmawan</h1>
              <p className="mt-1.5 text-sm font-semibold text-ink/55">
                {openToday > 0 ? `${openToday} agenda menunggu hari ini` : 'Semua agenda hari ini beres'} · panen cabai C-1 di depan mata
              </p>
            </div>
            <div className="animate-rise flex items-center gap-3" style={{ animationDelay: '90ms' }}>
              <div className="rounded-xl bg-moss-950 px-4 py-2.5 text-paper shadow-md shadow-ink/10">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-paper/45">Waktu kebun</p>
                <p className="font-display text-xl font-extrabold tabular-nums leading-tight">{clock} WIB</p>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-line bg-card px-4 py-2.5 shadow-sm">
                <span className="animate-sway flex h-10 w-10 items-center justify-center rounded-lg bg-hay-100 text-hay-600">
                  <SunCloudIcon className="h-5.5 w-5.5" />
                </span>
                <div>
                  <p className="font-display text-xl font-extrabold leading-tight">{temp}°C</p>
                  <p className="text-[11px] font-bold text-ink/55">{cond}</p>
                </div>
                <div className="ml-1 space-y-1 border-l border-line pl-3 text-[10px] font-bold text-ink/50">
                  <p className="flex items-center gap-1"><DropIcon className="h-3 w-3 text-air-500" /> {humidity}%</p>
                  <p className="flex items-center gap-1"><WindIcon className="h-3 w-3 text-air-500" /> {wind} km/j</p>
                </div>
              </div>
            </div>
          </header>
        </div>

        <Ticker />

        <div className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
          <div key={tab} className="animate-rise">
            {tab === 'ringkasan' && <Dashboard store={store} setStore={setStore} go={setTab} />}
            {tab === 'tanaman' && <Crops store={store} setStore={setStore} />}
            {tab === 'ternak' && <Livestock store={store} setStore={setStore} />}
            {tab === 'agenda' && <Tasks store={store} setStore={setStore} />}
            {tab === 'gudang' && <Inventory store={store} setStore={setStore} />}
            {tab === 'keuangan' && <Finance store={store} setStore={setStore} />}
          </div>
        </div>

        <footer className="border-t border-line py-6">
          <p className="px-4 text-center text-xs font-semibold text-ink/40">
            TaniPadu · papan kendali pertanian terpadu — Kebun Sukamaju, Desa Sukamaju · data tersimpan lokal di perangkat Anda
          </p>
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Shell />
    </ToastProvider>
  );
}
