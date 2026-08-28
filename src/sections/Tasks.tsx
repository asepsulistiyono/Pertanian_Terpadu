import { useMemo, useState, type Dispatch, type FormEvent, type ReactNode, type SetStateAction } from 'react';
import {
  addDays,
  daysUntil,
  fmtShort,
  PRIORITY_META,
  TASK_META,
  todayISO,
  uid,
  type Store,
  type Task,
  type TaskCat,
} from '../lib';
import {
  BellIcon,
  BoxIcon,
  CalendarIcon,
  CheckIcon,
  ClipboardIcon,
  CloudIcon,
  CowIcon,
  DropIcon,
  FlagIcon,
  LeafIcon,
  PlusIcon,
  WheatIcon,
  XIcon,
} from '../icons';
import { Card, EmptyState, Field, inputCls, Modal, ProgressBar, Reveal, SectionHead, useToast } from '../ui';

type Props = { store: Store; setStore: Dispatch<SetStateAction<Store>> };

const catIcon: Record<TaskCat, ReactNode> = {
  irigasi: <DropIcon className="h-3.5 w-3.5" />,
  pemupukan: <LeafIcon className="h-3.5 w-3.5" />,
  panen: <WheatIcon className="h-3.5 w-3.5" />,
  perawatan: <CloudIcon className="h-3.5 w-3.5" />,
  ternak: <CowIcon className="h-3.5 w-3.5" />,
  umum: <BoxIcon className="h-3.5 w-3.5" />,
};

export default function Tasks({ store, setStore }: Props) {
  const toast = useToast();
  const { tasks } = store;
  const today = todayISO();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', cat: 'perawatan' as TaskCat, date: todayISO(), priority: 2 as 1 | 2 | 3 });

  const groups = useMemo(() => {
    const active = tasks.filter((t) => !t.done);
    const bucket = (label: string, list: Task[]) => ({ label, list });
    return [
      bucket('Terlewat', active.filter((t) => t.date < today)),
      bucket('Hari Ini', active.filter((t) => t.date === today)),
      bucket('Besok', active.filter((t) => daysUntil(t.date) === 1)),
      bucket('2–7 Hari ke Depan', active.filter((t) => { const d = daysUntil(t.date); return d >= 2 && d <= 7; })),
      bucket('Lebih dari Seminggu', active.filter((t) => daysUntil(t.date) > 7)),
      bucket('Selesai', tasks.filter((t) => t.done)),
    ].filter((g) => g.list.length > 0);
  }, [tasks, today]);

  const doneCount = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? (doneCount / tasks.length) * 100 : 0;

  const toggle = (t: Task) => {
    setStore((s) => ({ ...s, tasks: s.tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)) }));
    if (!t.done) toast('Agenda ditandai selesai');
  };

  const remove = (t: Task) => {
    setStore((s) => ({ ...s, tasks: s.tasks.filter((x) => x.id !== t.id) }));
    toast('Agenda dihapus', 'warn');
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast('Judul agenda wajib diisi', 'err');
      return;
    }
    setStore((s) => ({ ...s, tasks: [...s.tasks, { id: uid(), done: false, ...form, title: form.title.trim() }] }));
    toast(`Agenda "${form.title.trim()}" dijadwalkan ${form.date === today ? 'hari ini' : fmtShort(form.date)}`);
    setOpen(false);
    setForm({ title: '', cat: 'perawatan', date: todayISO(), priority: 2 });
  };

  return (
    <div>
      <SectionHead
        kicker="Modul Agenda"
        title="Rencana Kerja Kebun"
        desc="Dari irigasi sampai panen — semua pekerjaan tercatat dan terkelompok otomatis."
      >
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-moss-950 px-4 py-2.5 text-sm font-bold text-paper shadow-sm transition-all hover:-translate-y-0.5 hover:bg-moss-800 hover:shadow-md"
        >
          <PlusIcon className="h-4 w-4" /> Buat Agenda
        </button>
      </SectionHead>

      <Reveal>
        <Card className="mb-6 p-5">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-bold">Progres keseluruhan</p>
            <p className="text-xs font-extrabold tabular-nums text-ink/50">
              {doneCount} dari {tasks.length} agenda selesai · {Math.round(pct)}%
            </p>
          </div>
          <ProgressBar value={pct} className="h-2.5" />
        </Card>
      </Reveal>

      {groups.length === 0 ? (
        <EmptyState
          icon={<ClipboardIcon className="h-6 w-6" />}
          title="Belum ada agenda"
          desc="Jadwalkan pekerjaan kebun pertama Anda — irigasi, pemupukan, atau panen."
          action={
            <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-lg bg-leaf-600 px-4 py-2 text-sm font-bold text-paper transition-transform hover:-translate-y-0.5">
              <PlusIcon className="h-4 w-4" /> Buat Agenda
            </button>
          }
        />
      ) : (
        <div className="space-y-6">
          {groups.map((g, gi) => (
            <Reveal key={g.label} delay={Math.min(gi, 4) * 60}>
              <section>
                <h3 className="mb-2.5 flex items-center gap-2 font-display text-base font-bold">
                  {g.label}
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${g.label === 'Terlewat' ? 'bg-clay-100 text-clay-600' : g.label === 'Selesai' ? 'bg-leaf-100 text-leaf-700' : 'bg-moss-100 text-moss-700'}`}>
                    {g.list.length}
                  </span>
                  {g.label === 'Terlewat' && <BellIcon className="h-4 w-4 text-clay-500" />}
                </h3>
                <ul className="space-y-2">
                  {g.list
                    .slice()
                    .sort((a, b) => a.date.localeCompare(b.date) || a.priority - b.priority)
                    .map((t) => (
                      <li
                        key={t.id}
                        className={`group flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-all hover:-translate-y-0.5 hover:shadow-sm ${
                          t.done ? 'border-line bg-card/60' : t.date < today ? 'border-clay-200 bg-clay-100/40' : 'border-line bg-card'
                        }`}
                      >
                        <button
                          onClick={() => toggle(t)}
                          title={t.done ? 'Tandai belum selesai' : 'Tandai selesai'}
                          className={`flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                            t.done ? 'border-leaf-500 bg-leaf-500 text-paper' : 'border-ink/25 bg-card hover:border-leaf-500'
                          }`}
                        >
                          {t.done && <CheckIcon className="h-3 w-3" />}
                        </button>
                        <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${TASK_META[t.cat].chip}`}>
                          {catIcon[t.cat]}
                          <span className="hidden sm:inline">{TASK_META[t.cat].label}</span>
                        </span>
                        <p className={`min-w-0 flex-1 truncate text-sm font-semibold ${t.done ? 'text-ink/40 line-through' : ''}`}>{t.title}</p>
                        <span className={`hidden items-center gap-1 text-[11px] font-extrabold sm:flex ${PRIORITY_META[t.priority].cls}`}>
                          <FlagIcon className="h-3.5 w-3.5" /> {PRIORITY_META[t.priority].label}
                        </span>
                        <span className="flex shrink-0 items-center gap-1 rounded-md bg-paper px-2 py-1 text-[11px] font-bold text-ink/50">
                          <CalendarIcon className="h-3.5 w-3.5" /> {fmtShort(t.date)}
                        </span>
                        <button
                          onClick={() => remove(t)}
                          title="Hapus"
                          className="shrink-0 rounded-md p-1.5 text-ink/30 opacity-0 transition-all hover:bg-clay-100 hover:text-clay-600 group-hover:opacity-100"
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                </ul>
              </section>
            </Reveal>
          ))}
        </div>
      )}

      {/* ===== Modal ===== */}
      <Modal open={open} onClose={() => setOpen(false)} title="Buat Agenda Baru">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Judul Agenda *">
            <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="cth. Pemupukan susulan jagung B-1" />
          </Field>
          <Field label="Kategori">
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(TASK_META) as TaskCat[]).map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setForm({ ...form, cat: c })}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-bold transition-all ${
                    form.cat === c ? 'border-leaf-600 bg-leaf-600 text-paper' : 'border-line bg-card text-ink/60 hover:border-leaf-400'
                  }`}
                >
                  {catIcon[c]} {TASK_META[c].label}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tanggal">
              <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value || addDays(today, 1) })} />
            </Field>
            <Field label="Prioritas">
              <select className={inputCls} value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) as 1 | 2 | 3 })}>
                <option value={1}>Tinggi — harus segera</option>
                <option value={2}>Sedang</option>
                <option value={3}>Rendah</option>
              </select>
            </Field>
          </div>
          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-line px-4 py-2 text-sm font-bold text-ink/60 transition-colors hover:bg-moss-50">
              Batal
            </button>
            <button type="submit" className="rounded-lg bg-moss-950 px-5 py-2 text-sm font-bold text-paper transition-all hover:-translate-y-0.5 hover:bg-moss-800">
              Jadwalkan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
