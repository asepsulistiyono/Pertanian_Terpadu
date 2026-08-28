import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { STAGE_ORDER, STAGES, fmtIDRk, type Stage } from './lib';
import { BellIcon, CheckIcon, XIcon } from './icons';

/* ================= Hook ================= */

export function useLocalStorage<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw) as T;
    } catch {
      /* abaikan */
    }
    return initial;
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* abaikan */
    }
  }, [key, value]);
  return [value, setValue];
}

export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

/* ================= Reveal saat scroll ================= */

export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVis(true);
          ob.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        vis ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ================= Toast ================= */

type ToastKind = 'ok' | 'warn' | 'err';
const ToastCtx = createContext<(msg: string, kind?: ToastKind) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{ id: number; msg: string; kind: ToastKind }[]>([]);
  const push = useCallback((msg: string, kind: ToastKind = 'ok') => {
    const id = Date.now() + Math.random();
    setItems((p) => [...p.slice(-3), { id, msg, kind }]);
    window.setTimeout(() => setItems((p) => p.filter((t) => t.id !== id)), 3400);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[90] flex flex-col items-end gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={`animate-toast flex items-center gap-3 rounded-lg border bg-moss-950 py-3 pl-3 pr-4 text-paper shadow-xl shadow-ink/25 ${
              t.kind === 'err' ? 'border-clay-500' : t.kind === 'warn' ? 'border-hay-500' : 'border-leaf-500'
            }`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                t.kind === 'err' ? 'bg-clay-500' : t.kind === 'warn' ? 'bg-hay-500' : 'bg-leaf-500'
              } text-moss-950`}
            >
              {t.kind === 'ok' ? <CheckIcon className="h-3.5 w-3.5" /> : <BellIcon className="h-3.5 w-3.5" />}
            </span>
            <p className="text-sm font-semibold">{t.msg}</p>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ================= Modal ================= */

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
      <button
        aria-label="Tutup"
        className="animate-fadein absolute inset-0 cursor-default bg-moss-950/60 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="animate-pop relative w-full max-w-lg rounded-xl border border-line bg-card shadow-2xl shadow-ink/25">
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="font-display text-lg font-bold tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-ink/50 transition-colors hover:bg-moss-50 hover:text-ink"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </header>
        <div className="max-h-[75vh] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

/* ================= Formulir ================= */

export const inputCls =
  'w-full rounded-lg border border-line bg-white/80 px-3 py-2 text-sm outline-none transition-all placeholder:text-ink/30 focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/25';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-ink/50">
        {label}
      </span>
      {children}
    </label>
  );
}

/* ================= Komponen kecil ================= */

export function SectionHead({
  kicker,
  title,
  desc,
  children,
}: {
  kicker: string;
  title: string;
  desc?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-leaf-600">
          {kicker}
        </p>
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-[1.7rem]">{title}</h2>
        {desc && <p className="mt-1 max-w-xl text-sm text-ink/55">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={`rounded-xl border border-line bg-card shadow-sm shadow-ink/5 transition-shadow duration-300 hover:shadow-md hover:shadow-ink/10 ${className}`}
    >
      {children}
    </div>
  );
}

export function ProgressBar({
  value,
  color = 'var(--color-leaf-500)',
  className = '',
}: {
  value: number;
  color?: string;
  className?: string;
}) {
  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-ink/10 ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
      />
    </div>
  );
}

export function Sparkline({
  data,
  className = 'h-8 w-24',
  stroke = 'var(--color-leaf-500)',
}: {
  data: number[];
  className?: string;
  stroke?: string;
}) {
  const w = 96;
  const h = 30;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const pts = data
    .map(
      (v, i) =>
        `${((i / (data.length - 1)) * w).toFixed(1)},${(
          h - 3 - ((v - min) / (max - min || 1)) * (h - 7)
        ).toFixed(1)}`
    )
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} preserveAspectRatio="none">
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={stroke} opacity="0.12" />
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Donut({
  value,
  size = 64,
  stroke = 7,
  color = 'var(--color-leaf-500)',
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.min(1, Math.max(0, value));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

export function CashBars({
  data,
  height = 150,
}: {
  data: { label: string; masuk: number; keluar: number }[];
  height?: number;
}) {
  const [hov, setHov] = useState<number | null>(null);
  const max = Math.max(...data.flatMap((d) => [d.masuk, d.keluar]), 1);
  return (
    <div>
      <div className="relative flex items-end gap-2 sm:gap-4" style={{ height }}>
        {hov !== null && (
          <div
            className="pointer-events-none absolute -top-1 z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-line bg-moss-950 px-3 py-2 text-paper shadow-lg"
            style={{ left: `${((hov + 0.5) / data.length) * 100}%` }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-paper/60">
              {data[hov].label}
            </p>
            <p className="whitespace-nowrap text-xs font-semibold text-leaf-300">
              Masuk {fmtIDRk(data[hov].masuk)}
            </p>
            <p className="whitespace-nowrap text-xs font-semibold text-clay-300">
              Keluar {fmtIDRk(data[hov].keluar)}
            </p>
          </div>
        )}
        {data.map((d, i) => (
          <div
            key={i}
            className="group flex h-full flex-1 cursor-default items-end justify-center gap-1 sm:gap-1.5"
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}
          >
            <div
              className="w-full max-w-[24px] rounded-t-[5px] bg-leaf-500 transition-all duration-500 group-hover:bg-leaf-600"
              style={{ height: `${Math.max(3, (d.masuk / max) * 100)}%` }}
            />
            <div
              className="w-full max-w-[24px] rounded-t-[5px] bg-clay-400/80 transition-all duration-500 group-hover:bg-clay-500"
              style={{ height: `${Math.max(3, (d.keluar / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2 border-t border-line pt-2 sm:gap-4">
        {data.map((d, i) => (
          <p key={i} className="flex-1 text-center text-[11px] font-bold uppercase tracking-wider text-ink/45">
            {d.label}
          </p>
        ))}
      </div>
    </div>
  );
}

export function StageStepper({ stage }: { stage: Stage }) {
  const idx = STAGE_ORDER.indexOf(stage);
  return (
    <div className="flex items-center gap-1" title={STAGES[stage].label}>
      {STAGE_ORDER.map((s, i) => (
        <span
          key={s}
          className={`h-1.5 rounded-full transition-all duration-500 ${
            i <= idx ? 'w-6 bg-leaf-500' : 'w-3 bg-ink/15'
          }`}
        />
      ))}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  desc,
  action,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-card/60 px-6 py-12 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-moss-50 text-moss-500">
        {icon}
      </div>
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink/55">{desc}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
