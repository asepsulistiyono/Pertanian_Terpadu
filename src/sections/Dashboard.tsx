import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import {
  daysUntil,
  fmtIDRk,
  fmtShort,
  monthlySeries,
  relDays,
  todayISO,
  STAGES,
  TASK_META,
  type Crop,
  type Stage,
  type Store,
  type Tab,
} from '../lib';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BarnIcon,
  BellIcon,
  BoxIcon,
  CalendarIcon,
  CheckIcon,
  ChevronRightIcon,
  CoinsIcon,
  CowIcon,
  DropIcon,
  LeafIcon,
  MapIcon,
  WheatIcon,
} from '../icons';
import {
  Card,
  EmptyState,
  ProgressBar,
  Reveal,
  Sparkline,
  CashBars,
  useToast,
} from '../ui';

type Props = {
  store: Store;
  setStore: Dispatch<SetStateAction<Store>>;
  go: (t: Tab) => void;
};

const stageChip: Record<Stage, string> = {
  persemaian: 'bg-air-100 text-air-700',
  vegetatif: 'bg-moss-100 text-moss-700',
  generatif: 'bg-leaf-100 text-leaf-700',
  'siap-panen': 'bg-hay-100 text-hay-700',
};

const PLOTS: { code: string; points: string; lx: number; ly: number }[] = [
  { code: 'A-1', points: '40,42 298,30 306,168 48,180', lx: 170, ly: 108 },
  { code: 'A-2', points: '50,196 308,184 314,314 58,324', lx: 182, ly: 256 },
  { code: 'B-1', points: '320,28 556,42 546,150 328,164', lx: 436, ly: 98 },
  { code: 'C-1', points: '334,180 468,172 472,248 340,256', lx: 402, ly: 216 },
  { code: 'C-2', points: '484,170 590,164 594,244 488,250', lx: 538, ly: 208 },
  { code: 'D-1', points: '342,270 472,262 476,336 348,344', lx: 408, ly: 302 },
  { code: 'D-2', points: '488,260 592,254 596,328 492,334', lx: 542, ly: 296 },
];

function FarmMap({
  crops,
  sel,
  setSel,
}: {
  crops: Crop[];
  sel: string;
  setSel: (s: string) => void;
}) {
  return (
    <svg viewBox="0 0 640 400" className="w-full" role="img" aria-label="Peta lahan kebun">
      <defs>
        <pattern id="rows" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <line x1="0" y1="0" x2="0" y2="9" stroke="rgba(255,255,255,0.28)" strokeWidth="2.4" />
        </pattern>
      </defs>

      {/* jalur irigasi */}
      <path
        d="M300 366 C 308 300 316 240 312 180 C 309 132 314 84 318 34"
        fill="none"
        stroke="var(--color-air-400)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="2 11"
        className="animate-dash"
        opacity="0.85"
      />

      {/* petak tanaman */}
      {PLOTS.map((p) => {
        const crop = crops.find((c) => c.plot === p.code);
        const active = sel === p.code;
        return (
          <g key={p.code} onClick={() => setSel(p.code)} className="cursor-pointer">
            <polygon
              points={p.points}
              fill={crop ? crop.color : 'var(--color-line)'}
              stroke="#1d2a20"
              strokeOpacity={active ? 0.75 : 0.18}
              strokeWidth={active ? 2.4 : 1}
              className={`transition-all duration-300 ${active ? 'opacity-100' : 'opacity-80 hover:opacity-95'}`}
            />
            {crop && <polygon points={p.points} fill="url(#rows)" className="pointer-events-none" />}
            <text
              x={p.lx}
              y={p.ly}
              textAnchor="middle"
              fontSize="11"
              fontWeight="800"
              fill="#1d2a20"
              opacity="0.65"
              className="pointer-events-none"
            >
              {p.code}
            </text>
            <text
              x={p.lx}
              y={p.ly + 14}
              textAnchor="middle"
              fontSize="9"
              fontWeight="600"
              fill="#1d2a20"
              opacity="0.45"
              className="pointer-events-none"
            >
              {crop ? `${crop.area.toLocaleString('id-ID')} ha` : 'bera'}
            </text>
          </g>
        );
      })}

      {/* kolam */}
      <g onClick={() => setSel('KOLAM')} className="cursor-pointer">
        <polygon
          points="60,340 218,332 224,382 66,388"
          fill="var(--color-air-300)"
          stroke="#1d2a20"
          strokeOpacity={sel === 'KOLAM' ? 0.7 : 0.18}
          strokeWidth={sel === 'KOLAM' ? 2.2 : 1}
          opacity="0.9"
          className="transition-all duration-300"
        />
        <text x="142" y="364" textAnchor="middle" fontSize="10" fontWeight="800" fill="#1d2a20" opacity="0.6" className="pointer-events-none">
          KOLAM
        </text>
      </g>

      {/* kandang */}
      <g onClick={() => setSel('KANDANG')} className="cursor-pointer">
        <polygon
          points="236,330 330,326 334,384 242,388"
          fill="var(--color-hay-300)"
          stroke="#1d2a20"
          strokeOpacity={sel === 'KANDANG' ? 0.7 : 0.18}
          strokeWidth={sel === 'KANDANG' ? 2.2 : 1}
          opacity="0.9"
          className="transition-all duration-300"
        />
        <path d="M262 372v-15l22-13 22 13v15z" fill="none" stroke="#1d2a20" strokeOpacity="0.55" strokeWidth="1.6" className="pointer-events-none" />
        <path d="M278 372v-9h12v9" fill="none" stroke="#1d2a20" strokeOpacity="0.55" strokeWidth="1.6" className="pointer-events-none" />
      </g>

      {/* kincir angin */}
      <g>
        <line x1="601" y1="108" x2="601" y2="72" stroke="#1d2a20" strokeOpacity="0.6" strokeWidth="2.5" strokeLinecap="round" />
        <g transform="translate(601 70)">
          <g>
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="13s" repeatCount="indefinite" />
            {[0, 120, 240].map((r) => (
              <path
                key={r}
                d="M0 -27 C 7 -19 7 -8 0 -2 C -7 -8 -7 -19 0 -27z"
                transform={`rotate(${r})`}
                fill="var(--color-moss-400)"
                stroke="#1d2a20"
                strokeOpacity="0.35"
                strokeWidth="1"
              />
            ))}
            <circle r="3" fill="#1d2a20" opacity="0.7" />
          </g>
        </g>
      </g>

      {/* pepohonan */}
      <g opacity="0.85">
        <line x1="22" y1="252" x2="22" y2="262" stroke="#1d2a20" strokeOpacity="0.5" strokeWidth="2" />
        <circle cx="22" cy="246" r="8" fill="var(--color-moss-300)" />
        <line x1="620" y1="352" x2="620" y2="363" stroke="#1d2a20" strokeOpacity="0.5" strokeWidth="2" />
        <circle cx="620" cy="345" r="9" fill="var(--color-moss-300)" />
        <circle cx="606" cy="352" r="6" fill="var(--color-moss-200)" />
      </g>
    </svg>
  );
}

export default function Dashboard({ store, setStore, go }: Props) {
  const toast = useToast();
  const today = todayISO();
  const [sel, setSel] = useState('C-1');
  const { crops, animals, tasks, inv, ledger } = store;

  const series = useMemo(() => monthlySeries(ledger, 6), [ledger]);
  const luas = crops.reduce((a, c) => a + c.area, 0);
  const totalTernak = animals.reduce((a, g) => a + g.count, 0);
  const totalSick = animals.reduce((a, g) => a + g.sick, 0);
  const masukNow = series[series.length - 1].masuk;
  const masukPrev = series[series.length - 2].masuk;
  const delta = masukPrev > 0 ? ((masukNow - masukPrev) / masukPrev) * 100 : 100;

  const todayTasks = tasks.filter((t) => t.date === today);
  const doneToday = todayTasks.filter((t) => t.done).length;

  const alerts = useMemo(() => {
    const out: { text: string; tone: 'hay' | 'clay'; icon: 'leaf' | 'box' | 'cow' | 'bell' }[] = [];
    crops.forEach((c) => {
      const d = daysUntil(c.harvestEst);
      if (c.stage === 'siap-panen' || (d >= 0 && d <= 7))
        out.push({ text: `${c.name} ${c.plot} siap dipanen — ${d <= 0 ? 'sekarang' : relDays(c.harvestEst)}`, tone: 'hay', icon: 'leaf' });
    });
    inv.forEach((i) => {
      if (i.stock <= i.min)
        out.push({ text: `Stok ${i.name} menipis (${i.stock}/${i.min} ${i.unit})`, tone: 'clay', icon: 'box' });
    });
    animals.forEach((a) => {
      if (a.sick > 0)
        out.push({ text: `${a.sick} ekor ${a.species} terindikasi sakit — perlu pemeriksaan`, tone: 'clay', icon: 'cow' });
    });
    const overdue = tasks.filter((t) => !t.done && t.date < today).length;
    if (overdue > 0) out.push({ text: `${overdue} agenda terlewat belum dikerjakan`, tone: 'hay', icon: 'bell' });
    return out;
  }, [crops, inv, animals, tasks, today]);

  const selCrop = crops.find((c) => c.plot === sel);
  const harvests = crops
    .filter((c) => daysUntil(c.harvestEst) >= 0)
    .sort((a, b) => daysUntil(a.harvestEst) - daysUntil(b.harvestEst));
  const lowStock = inv.filter((i) => i.stock <= i.min);

  const toggleTask = (id: string) => {
    const t = tasks.find((x) => x.id === id);
    setStore((s) => ({ ...s, tasks: s.tasks.map((x) => (x.id === id ? { ...x, done: !x.done } : x)) }));
    if (t && !t.done) toast('Agenda ditandai selesai');
  };

  const alertIcon = (k: string) =>
    k === 'leaf' ? <LeafIcon className="h-4 w-4" /> : k === 'box' ? <BoxIcon className="h-4 w-4" /> : k === 'cow' ? <CowIcon className="h-4 w-4" /> : <BellIcon className="h-4 w-4" />;

  return (
    <div className="space-y-6">
      {/* ===== Peta lahan + papan pagi ===== */}
      <div className="grid gap-5 xl:grid-cols-3">
        <Reveal className="xl:col-span-2">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-moss-950 text-leaf-300">
                  <MapIcon className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold leading-tight">Peta Lahan Kebun Sukamaju</h3>
                  <p className="text-xs text-ink/50">
                    {luas.toLocaleString('id-ID', { maximumFractionDigits: 1 })} ha · {crops.length} petak ditanami · klik petak untuk detail
                  </p>
                </div>
              </div>
              <span className="hidden items-center gap-1.5 rounded-full bg-air-100 px-3 py-1 text-[11px] font-bold text-air-700 sm:flex">
                <DropIcon className="h-3.5 w-3.5" /> Irigasi aktif
              </span>
            </div>
            <FarmMap crops={crops} sel={sel} setSel={setSel} />

            {/* detail petak terpilih */}
            <div className="mt-4 rounded-lg border border-line bg-paper/70 p-4">
              {sel === 'KOLAM' ? (
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-air-100 text-air-600"><DropIcon /></span>
                  <div>
                    <p className="font-display font-bold">Kolam & Bebek Tegal</p>
                    <p className="text-xs text-ink/55">Sumber irigasi cadangan + kandang bebek · 85 ekor aktif bertelur.</p>
                  </div>
                  <button onClick={() => go('ternak')} className="ml-auto flex items-center gap-1 rounded-lg bg-moss-950 px-3 py-2 text-xs font-bold text-paper transition-transform hover:-translate-y-0.5">
                    Modul Ternak <ChevronRightIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : sel === 'KANDANG' ? (
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-hay-100 text-hay-600"><BarnIcon /></span>
                  <div>
                    <p className="font-display font-bold">Kandang Terpadu</p>
                    <p className="text-xs text-ink/55">Sapi PO & kambing Boerka · kotoran diolah jadi pupuk kandang fermentasi.</p>
                  </div>
                  <button onClick={() => go('ternak')} className="ml-auto flex items-center gap-1 rounded-lg bg-moss-950 px-3 py-2 text-xs font-bold text-paper transition-transform hover:-translate-y-0.5">
                    Modul Ternak <ChevronRightIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : selCrop ? (
                <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-paper" style={{ background: selCrop.color }}>
                    <WheatIcon />
                  </span>
                  <div className="min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <p className="font-display font-bold leading-tight">{selCrop.name}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${stageChip[selCrop.stage]}`}>
                        {STAGES[selCrop.stage].label}
                      </span>
                    </div>
                    <p className="text-xs text-ink/55">
                      {selCrop.variety} · petak {selCrop.plot} · {selCrop.area.toLocaleString('id-ID')} ha · panen {relDays(selCrop.harvestEst)}
                    </p>
                  </div>
                  <div className="min-w-[150px] flex-1">
                    <div className="mb-1 flex justify-between text-[11px] font-bold text-ink/50">
                      <span>Pertumbuhan</span>
                      <span>{selCrop.progress}%</span>
                    </div>
                    <ProgressBar value={selCrop.progress} color={selCrop.color} />
                  </div>
                  <button onClick={() => go('tanaman')} className="flex items-center gap-1 rounded-lg bg-moss-950 px-3 py-2 text-xs font-bold text-paper transition-transform hover:-translate-y-0.5">
                    Kelola <ChevronRightIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink/10 text-ink/50"><WheatIcon /></span>
                  <div>
                    <p className="font-display font-bold">Petak {sel} — Bera</p>
                    <p className="text-xs text-ink/55">Belum ditanami. Cocok untuk rotasi kacang-kacangan musim ini.</p>
                  </div>
                  <button onClick={() => go('tanaman')} className="ml-auto flex items-center gap-1 rounded-lg bg-leaf-600 px-3 py-2 text-xs font-bold text-paper transition-transform hover:-translate-y-0.5">
                    Tambah Tanaman <ChevronRightIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* legenda */}
            <div className="mt-3 flex flex-wrap gap-2">
              {crops.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSel(c.plot)}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all hover:-translate-y-0.5 ${
                    sel === c.plot ? 'border-ink/60 bg-moss-950 text-paper' : 'border-line bg-card text-ink/70'
                  }`}
                >
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: c.color }} />
                  {c.plot} {c.name}
                </button>
              ))}
            </div>
          </Card>
        </Reveal>

        {/* ===== Papan pagi + peringatan ===== */}
        <div className="space-y-5">
          <Reveal delay={90}>
            <Card className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">Papan Pagi Ini</h3>
                <span className="rounded-full bg-leaf-100 px-2.5 py-1 text-[11px] font-extrabold text-leaf-700">
                  {doneToday}/{todayTasks.length} selesai
                </span>
              </div>
              {todayTasks.length === 0 ? (
                <p className="rounded-lg bg-paper/80 px-3 py-4 text-sm text-ink/55">
                  Tidak ada agenda hari ini. Waktunya cek irigasi keliling kebun.
                </p>
              ) : (
                <ul className="space-y-2">
                  {todayTasks.map((t) => (
                    <li key={t.id}>
                      <button
                        onClick={() => toggleTask(t.id)}
                        className="group flex w-full items-center gap-3 rounded-lg border border-line bg-paper/60 px-3 py-2.5 text-left transition-all hover:border-leaf-500/50 hover:bg-leaf-100/40"
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                            t.done ? 'border-leaf-500 bg-leaf-500 text-paper' : 'border-ink/25 bg-card group-hover:border-leaf-500'
                          }`}
                        >
                          {t.done && <CheckIcon className="h-3 w-3" />}
                        </span>
                        <span className={`flex-1 text-sm font-semibold ${t.done ? 'text-ink/40 line-through' : ''}`}>{t.title}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${TASK_META[t.cat].chip}`}>
                          {TASK_META[t.cat].label}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button
                onClick={() => go('agenda')}
                className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-line py-2 text-xs font-bold text-ink/60 transition-colors hover:border-leaf-500 hover:text-leaf-700"
              >
                Buka agenda lengkap <ChevronRightIcon className="h-3.5 w-3.5" />
              </button>
            </Card>
          </Reveal>

          <Reveal delay={160}>
            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  {alerts.length > 0 && <span className="animate-pip absolute inline-flex h-full w-full rounded-full bg-clay-400" />}
                  <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${alerts.length ? 'bg-clay-500' : 'bg-leaf-500'}`} />
                </span>
                <h3 className="font-display text-lg font-bold">Peringatan Aktif</h3>
                <span className="ml-auto rounded-full bg-clay-100 px-2.5 py-1 text-[11px] font-extrabold text-clay-600">
                  {alerts.length}
                </span>
              </div>
              {alerts.length === 0 ? (
                <p className="rounded-lg bg-paper/80 px-3 py-4 text-sm text-ink/55">Semua terkendali. Kebun dalam kondisi prima.</p>
              ) : (
                <ul className="space-y-2">
                  {alerts.map((a, i) => (
                    <li
                      key={i}
                      className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm font-semibold ${
                        a.tone === 'clay' ? 'border-clay-200 bg-clay-100/50 text-clay-700' : 'border-hay-200 bg-hay-100/50 text-hay-700'
                      }`}
                    >
                      <span className="mt-0.5 shrink-0">{alertIcon(a.icon)}</span>
                      {a.text}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </Reveal>
        </div>
      </div>

      {/* ===== Strip KPI ===== */}
      <Reveal delay={60}>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
          <div className="group bg-card p-5 transition-colors hover:bg-moss-50">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">Luas Lahan Garapan</p>
            <p className="mt-2 font-display text-3xl font-extrabold tracking-tight">
              {luas.toLocaleString('id-ID', { maximumFractionDigits: 1 })}
              <span className="ml-1 text-base font-bold text-ink/45">ha</span>
            </p>
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-ink/55">
              <WheatIcon className="h-3.5 w-3.5 text-leaf-600" /> {crops.length} komoditas · {crops.filter((c) => c.stage === 'siap-panen').length} siap panen
            </p>
          </div>
          <div className="group bg-card p-5 transition-colors hover:bg-moss-50">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">Populasi Ternak</p>
            <p className="mt-2 font-display text-3xl font-extrabold tracking-tight">
              {totalTernak.toLocaleString('id-ID')}
              <span className="ml-1 text-base font-bold text-ink/45">ekor</span>
            </p>
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-ink/55">
              <CowIcon className="h-3.5 w-3.5 text-hay-600" /> {animals.length} kandang · {totalSick} sakit
            </p>
          </div>
          <div className="group bg-card p-5 transition-colors hover:bg-moss-50">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">Rata-rata Kesehatan</p>
            <p className="mt-2 font-display text-3xl font-extrabold tracking-tight">
              {crops.length ? Math.round(crops.reduce((a, c) => a + c.health, 0) / crops.length) : 0}
              <span className="ml-1 text-base font-bold text-ink/45">%</span>
            </p>
            <Sparkline data={crops.map((c) => c.health)} className="mt-2 h-7 w-full" stroke="var(--color-leaf-500)" />
          </div>
          <div className="group bg-card p-5 transition-colors hover:bg-moss-50">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">Pemasukan Bulan Ini</p>
            <p className="mt-2 font-display text-3xl font-extrabold tracking-tight">{fmtIDRk(masukNow)}</p>
            <p className={`mt-1.5 flex items-center gap-1 text-xs font-bold ${delta >= 0 ? 'text-leaf-600' : 'text-clay-600'}`}>
              {delta >= 0 ? <ArrowUpIcon className="h-3.5 w-3.5" /> : <ArrowDownIcon className="h-3.5 w-3.5" />}
              {Math.abs(delta).toLocaleString('id-ID', { maximumFractionDigits: 1 })}% vs bulan lalu
            </p>
          </div>
        </div>
      </Reveal>

      {/* ===== Pertumbuhan + jadwal panen ===== */}
      <div className="grid gap-5 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <Card className="flex h-full flex-col p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Pertumbuhan Tanaman</h3>
              <button onClick={() => go('tanaman')} className="flex items-center gap-1 text-xs font-bold text-leaf-700 transition-colors hover:text-leaf-600">
                Semua tanaman <ChevronRightIcon className="h-3.5 w-3.5" />
              </button>
            </div>
            <ul className="space-y-3.5">
              {[...crops]
                .sort((a, b) => b.progress - a.progress)
                .slice(0, 6)
                .map((c) => (
                  <li key={c.id} className="group">
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: c.color }} />
                      <p className="truncate text-sm font-bold">{c.name}</p>
                      <span className="text-[11px] font-bold text-ink/40">{c.plot}</span>
                      <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${stageChip[c.stage]}`}>
                        {STAGES[c.stage].label}
                      </span>
                      <span className="w-9 text-right text-xs font-extrabold tabular-nums text-ink/60">{c.progress}%</span>
                    </div>
                    <ProgressBar value={c.progress} color={c.color} className="group-hover:h-2.5 transition-all" />
                  </li>
                ))}
            </ul>
          </Card>
        </Reveal>

        <Reveal delay={90} className="lg:col-span-2">
          <Card className="flex h-full flex-col p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-hay-100 text-hay-600"><CalendarIcon className="h-4 w-4" /></span>
              <h3 className="font-display text-lg font-bold">Jadwal Panen Terdekat</h3>
            </div>
            {harvests.length === 0 ? (
              <EmptyState icon={<WheatIcon className="h-6 w-6" />} title="Belum ada jadwal" desc="Tambahkan tanaman untuk melihat estimasi panen." />
            ) : (
              <ul className="space-y-2">
                {harvests.slice(0, 5).map((c) => {
                  const d = daysUntil(c.harvestEst);
                  return (
                    <li key={c.id} className="flex items-center gap-3 rounded-lg border border-line bg-paper/60 px-3 py-2.5 transition-all hover:-translate-y-0.5 hover:border-hay-300">
                      <div className="w-12 shrink-0 text-center">
                        <p className="font-display text-lg font-extrabold leading-none">{d}</p>
                        <p className="text-[10px] font-bold uppercase text-ink/45">hari</p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{c.name} · {c.plot}</p>
                        <p className="text-[11px] font-semibold text-ink/50">{fmtShort(c.harvestEst)} · {c.area.toLocaleString('id-ID')} ha</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${
                          d <= 7 ? 'bg-clay-100 text-clay-600' : d <= 21 ? 'bg-hay-100 text-hay-700' : 'bg-ink/8 text-ink/50'
                        }`}
                      >
                        {d <= 7 ? 'Segera' : d <= 21 ? 'Dekat' : 'Rutin'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </Reveal>
      </div>

      {/* ===== Arus kas + stok kritis ===== */}
      <div className="grid gap-5 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <Card className="flex h-full flex-col p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-moss-950 text-leaf-300"><CoinsIcon className="h-4 w-4" /></span>
                <h3 className="font-display text-lg font-bold">Arus Kas 6 Bulan</h3>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-bold text-ink/55">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-leaf-500" /> Pemasukan</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-clay-400" /> Pengeluaran</span>
              </div>
            </div>
            <CashBars data={series} height={150} />
          </Card>
        </Reveal>

        <Reveal delay={90} className="lg:col-span-2">
          <Card className="flex h-full flex-col p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Stok Perlu Restok</h3>
              <button onClick={() => go('gudang')} className="flex items-center gap-1 text-xs font-bold text-leaf-700 transition-colors hover:text-leaf-600">
                Gudang <ChevronRightIcon className="h-3.5 w-3.5" />
              </button>
            </div>
            {lowStock.length === 0 ? (
              <p className="rounded-lg bg-paper/80 px-3 py-4 text-sm text-ink/55">Semua stok di atas batas minimum. Gudang aman.</p>
            ) : (
              <ul className="space-y-3">
                {lowStock.map((i) => {
                  const pct = i.min > 0 ? (i.stock / i.min) * 100 : 100;
                  return (
                    <li key={i.id}>
                      <div className="mb-1 flex items-baseline justify-between gap-2">
                        <p className="text-sm font-bold">{i.name}</p>
                        <p className="text-[11px] font-extrabold tabular-nums text-clay-600">
                          {i.stock} / {i.min} {i.unit}
                        </p>
                      </div>
                      <ProgressBar value={pct} color="var(--color-clay-500)" />
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="mt-auto pt-4">
              <p className="rounded-lg bg-moss-50 px-3 py-2.5 text-[11px] font-semibold leading-relaxed text-moss-700">
                Sistem pertanian terpadu: kotoran ternak → pupuk kandang → lahan, sisa panen → pakan ternak.
              </p>
            </div>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
