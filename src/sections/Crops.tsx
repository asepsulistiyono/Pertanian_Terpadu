import { useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import {
  addDays,
  CROP_COLORS,
  daysUntil,
  fmtShort,
  PLOT_OPTIONS,
  relDays,
  STAGES,
  STAGE_ORDER,
  todayISO,
  uid,
  type Crop,
  type Stage,
  type Store,
} from '../lib';
import { CheckIcon, LeafIcon, PencilIcon, PlusIcon, SearchIcon, SproutIcon, TrashIcon, WheatIcon } from '../icons';
import { Card, EmptyState, Field, inputCls, Modal, ProgressBar, Reveal, SectionHead, StageStepper, useToast } from '../ui';

type Props = { store: Store; setStore: Dispatch<SetStateAction<Store>> };

const stageChip: Record<Stage, string> = {
  persemaian: 'bg-air-100 text-air-700',
  vegetatif: 'bg-moss-100 text-moss-700',
  generatif: 'bg-leaf-100 text-leaf-700',
  'siap-panen': 'bg-hay-100 text-hay-700',
};

const emptyForm = {
  name: '',
  variety: '',
  plot: 'A-1',
  area: 1,
  plantDate: todayISO(),
  harvestEst: addDays(todayISO(), 90),
  stage: 'persemaian' as Stage,
  color: CROP_COLORS[0],
};

export default function Crops({ store, setStore }: Props) {
  const toast = useToast();
  const { crops } = store;
  const [q, setQ] = useState('');
  const [stageFilter, setStageFilter] = useState<'semua' | Stage>('semua');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Crop | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(
    () =>
      crops
        .filter((c) => (stageFilter === 'semua' || c.stage === stageFilter) && (c.name + c.variety + c.plot).toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => a.plot.localeCompare(b.plot)),
    [crops, q, stageFilter]
  );

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };
  const openEdit = (c: Crop) => {
    setEditing(c);
    setForm({ name: c.name, variety: c.variety, plot: c.plot, area: c.area, plantDate: c.plantDate, harvestEst: c.harvestEst, stage: c.stage, color: c.color });
    setOpen(true);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast('Nama tanaman wajib diisi', 'err');
      return;
    }
    if (editing) {
      setStore((s) => ({ ...s, crops: s.crops.map((c) => (c.id === editing.id ? { ...c, ...form } : c)) }));
      toast(`Data ${form.name} diperbarui`);
    } else {
      setStore((s) => ({
        ...s,
        crops: [...s.crops, { id: uid(), health: 100, progress: Math.max(4, STAGES[form.stage].at - 6), ...form, name: form.name.trim() }],
      }));
      toast(`${form.name} ditambahkan ke petak ${form.plot}`);
    }
    setOpen(false);
  };

  const advance = (c: Crop) => {
    const idx = STAGE_ORDER.indexOf(c.stage);
    if (idx >= STAGE_ORDER.length - 1) return;
    const next = STAGE_ORDER[idx + 1];
    setStore((s) => ({
      ...s,
      crops: s.crops.map((x) => (x.id === c.id ? { ...x, stage: next, progress: Math.max(x.progress, STAGES[next].at) } : x)),
    }));
    toast(`${c.name} naik ke tahap ${STAGES[next].label}`);
  };

  const remove = (c: Crop) => {
    setStore((s) => ({ ...s, crops: s.crops.filter((x) => x.id !== c.id) }));
    toast(`${c.name} dihapus dari petak ${c.plot}`, 'warn');
  };

  const countBy = (st: 'semua' | Stage) => (st === 'semua' ? crops.length : crops.filter((c) => c.stage === st).length);

  return (
    <div>
      <SectionHead
        kicker="Modul Tanaman"
        title="Lahan & Budidaya"
        desc="Pantau tahap tumbuh tiap komoditas, dari persemaian sampai siap panen."
      >
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-moss-950 px-4 py-2.5 text-sm font-bold text-paper shadow-sm transition-all hover:-translate-y-0.5 hover:bg-moss-800 hover:shadow-md"
        >
          <PlusIcon className="h-4 w-4" /> Tambah Tanaman
        </button>
      </SectionHead>

      {/* filter */}
      <Reveal>
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari tanaman, varietas, petak…" className={`${inputCls} pl-9`} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(['semua', ...STAGE_ORDER] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStageFilter(st)}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-all hover:-translate-y-0.5 ${
                  stageFilter === st ? 'border-moss-950 bg-moss-950 text-paper' : 'border-line bg-card text-ink/60 hover:border-moss-300'
                }`}
              >
                {st === 'semua' ? 'Semua' : STAGES[st].label}
                <span className={`ml-1.5 ${stageFilter === st ? 'text-paper/60' : 'text-ink/35'}`}>{countBy(st)}</span>
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<WheatIcon className="h-6 w-6" />}
          title="Tidak ada tanaman ditemukan"
          desc="Ubah kata kunci pencarian atau mulai tanam komoditas baru di petak yang tersedia."
          action={
            <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-leaf-600 px-4 py-2 text-sm font-bold text-paper transition-transform hover:-translate-y-0.5">
              <PlusIcon className="h-4 w-4" /> Tanam Baru
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c, i) => {
            const canAdvance = c.stage !== 'siap-panen';
            return (
              <Reveal key={c.id} delay={Math.min(i, 5) * 60}>
                <Card className="group flex h-full flex-col overflow-hidden">
                  <div className="relative h-2.5" style={{ background: c.color }}>
                    <LeafIcon className="absolute -bottom-3 right-3 h-10 w-10 rotate-12 text-ink/8 transition-transform duration-500 group-hover:rotate-45" />
                  </div>
                  <div className="flex flex-1 flex-col p-4 pt-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-lg font-bold leading-tight">{c.name}</h3>
                        <p className="text-xs font-semibold text-ink/50">{c.variety} · Petak {c.plot}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${stageChip[c.stage]}`}>
                        {STAGES[c.stage].label}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink/40">Luas</p>
                        <p className="font-bold">{c.area.toLocaleString('id-ID')} ha</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink/40">Kesehatan</p>
                        <p className={`font-bold ${c.health < 80 ? 'text-clay-600' : 'text-leaf-700'}`}>{c.health}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink/40">Ditanam</p>
                        <p className="font-bold">{fmtShort(c.plantDate)} <span className="font-semibold text-ink/40">· {relDays(c.plantDate)}</span></p>
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink/40">Estimasi Panen</p>
                        <p className="font-bold">{fmtShort(c.harvestEst)} <span className="font-semibold text-ink/40">· {relDays(c.harvestEst)}</span></p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-1.5 flex items-center justify-between">
                        <StageStepper stage={c.stage} />
                        <span className="text-xs font-extrabold tabular-nums text-ink/55">{c.progress}%</span>
                      </div>
                      <ProgressBar value={c.progress} color={c.color} />
                    </div>

                    <div className="mt-4 flex items-center gap-2 border-t border-line pt-3.5">
                      <button
                        onClick={() => advance(c)}
                        disabled={!canAdvance}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                          canAdvance
                            ? 'bg-leaf-600 text-paper hover:-translate-y-0.5 hover:bg-leaf-700'
                            : 'cursor-default bg-hay-100 text-hay-700'
                        }`}
                      >
                        <SproutIcon className="h-3.5 w-3.5" />
                        {canAdvance ? `Naik ke ${STAGES[STAGE_ORDER[STAGE_ORDER.indexOf(c.stage) + 1]].label}` : 'Siap Dipanen'}
                      </button>
                      <button onClick={() => openEdit(c)} title="Ubah" className="rounded-lg border border-line p-2 text-ink/55 transition-colors hover:border-moss-300 hover:text-ink">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => remove(c)} title="Hapus" className="rounded-lg border border-line p-2 text-ink/55 transition-colors hover:border-clay-300 hover:bg-clay-100 hover:text-clay-600">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              </Reveal>
            );
          })}
        </div>
      )}

      {/* ===== Modal tambah/ubah ===== */}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? `Ubah ${editing.name}` : 'Tanam Komoditas Baru'}>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama Tanaman *">
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="cth. Padi, Cabai Rawit" />
            </Field>
            <Field label="Varietas">
              <input className={inputCls} value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} placeholder="cth. Inpari 32" />
            </Field>
            <Field label="Petak">
              <select className={inputCls} value={form.plot} onChange={(e) => setForm({ ...form, plot: e.target.value })}>
                {PLOT_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="Luas (ha)">
              <input type="number" min="0.1" step="0.1" className={inputCls} value={form.area} onChange={(e) => setForm({ ...form, area: parseFloat(e.target.value) || 0 })} />
            </Field>
            <Field label="Tanggal Tanam">
              <input type="date" className={inputCls} value={form.plantDate} onChange={(e) => setForm({ ...form, plantDate: e.target.value })} />
            </Field>
            <Field label="Estimasi Panen">
              <input type="date" className={inputCls} value={form.harvestEst} onChange={(e) => setForm({ ...form, harvestEst: e.target.value })} />
            </Field>
          </div>
          <Field label="Tahap Saat Ini">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {STAGE_ORDER.map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setForm({ ...form, stage: st })}
                  className={`rounded-lg border px-2 py-2 text-xs font-bold transition-all ${
                    form.stage === st ? 'border-leaf-600 bg-leaf-600 text-paper' : 'border-line bg-card text-ink/60 hover:border-leaf-400'
                  }`}
                >
                  {STAGES[st].label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Warna Petak di Peta">
            <div className="flex gap-2">
              {CROP_COLORS.map((col) => (
                <button
                  type="button"
                  key={col}
                  onClick={() => setForm({ ...form, color: col })}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-transform hover:scale-110 ${form.color === col ? 'ring-2 ring-ink ring-offset-2 ring-offset-card' : ''}`}
                  style={{ background: col }}
                >
                  {form.color === col && <CheckIcon className="h-4 w-4 text-paper" />}
                </button>
              ))}
            </div>
          </Field>
          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-line px-4 py-2 text-sm font-bold text-ink/60 transition-colors hover:bg-moss-50">
              Batal
            </button>
            <button type="submit" className="rounded-lg bg-moss-950 px-5 py-2 text-sm font-bold text-paper transition-all hover:-translate-y-0.5 hover:bg-moss-800">
              {editing ? 'Simpan Perubahan' : 'Mulai Tanam'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
