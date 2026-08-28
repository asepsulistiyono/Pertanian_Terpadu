import { useState, type Dispatch, type FormEvent, type ReactNode, type SetStateAction } from 'react';
import {
  relDays,
  SPECIES_META,
  todayISO,
  uid,
  type AnimalGroup,
  type Species,
  type Store,
} from '../lib';
import { BarnIcon, ChickenIcon, CowIcon, DuckIcon, GoatIcon, PencilIcon, PlusIcon, TrashIcon } from '../icons';
import { Card, Donut, EmptyState, Field, inputCls, Modal, Reveal, SectionHead, useToast } from '../ui';

type Props = { store: Store; setStore: Dispatch<SetStateAction<Store>> };

const speciesIcon: Record<Species, (cls: string) => ReactNode> = {
  sapi: (c) => <CowIcon className={c} />,
  kambing: (c) => <GoatIcon className={c} />,
  ayam: (c) => <ChickenIcon className={c} />,
  bebek: (c) => <DuckIcon className={c} />,
};

const speciesTone: Record<Species, string> = {
  sapi: 'bg-hay-100 text-hay-600',
  kambing: 'bg-moss-100 text-moss-600',
  ayam: 'bg-clay-100 text-clay-500',
  bebek: 'bg-air-100 text-air-600',
};

const emptyForm = {
  species: 'sapi' as Species,
  breed: '',
  count: 10,
  sick: 0,
  coop: 'Kandang Utara',
  note: '',
};

export default function Livestock({ store, setStore }: Props) {
  const toast = useToast();
  const { animals } = store;
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AnimalGroup | null>(null);
  const [form, setForm] = useState(emptyForm);

  const total = animals.reduce((a, g) => a + g.count, 0);
  const sick = animals.reduce((a, g) => a + g.sick, 0);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };
  const openEdit = (g: AnimalGroup) => {
    setEditing(g);
    setForm({ species: g.species, breed: g.breed, count: g.count, sick: g.sick, coop: g.coop, note: g.note });
    setOpen(true);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.breed.trim()) {
      toast('Ras / galur ternak wajib diisi', 'err');
      return;
    }
    if (editing) {
      setStore((s) => ({ ...s, animals: s.animals.map((g) => (g.id === editing.id ? { ...g, ...form } : g)) }));
      toast('Data ternak diperbarui');
    } else {
      setStore((s) => ({
        ...s,
        animals: [...s.animals, { id: uid(), lastCheck: todayISO(), ...form, breed: form.breed.trim() }],
      }));
      toast(`${form.count} ekor ${SPECIES_META[form.species].label.toLowerCase()} dicatat di ${form.coop}`);
    }
    setOpen(false);
  };

  const checkUp = (g: AnimalGroup) => {
    setStore((s) => ({ ...s, animals: s.animals.map((x) => (x.id === g.id ? { ...x, lastCheck: todayISO(), sick: 0 } : x)) }));
    toast(`Pemeriksaan ${SPECIES_META[g.species].label.toLowerCase()} tercatat — semua sehat`);
  };

  const remove = (g: AnimalGroup) => {
    setStore((s) => ({ ...s, animals: s.animals.filter((x) => x.id !== g.id) }));
    toast(`Kelompok ${SPECIES_META[g.species].label.toLowerCase()} dihapus`, 'warn');
  };

  return (
    <div>
      <SectionHead
        kicker="Modul Ternak"
        title="Kandang & Kesehatan Ternak"
        desc="Integrasi ternak dengan lahan: pakan dari sisa panen, kotoran jadi pupuk fermentasi."
      >
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-moss-950 px-4 py-2.5 text-sm font-bold text-paper shadow-sm transition-all hover:-translate-y-0.5 hover:bg-moss-800 hover:shadow-md"
        >
          <PlusIcon className="h-4 w-4" /> Tambah Ternak
        </button>
      </SectionHead>

      {/* ringkasan */}
      <Reveal>
        <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
          {[
            { label: 'Total Populasi', value: total.toLocaleString('id-ID'), sub: 'ekor semua jenis' },
            { label: 'Sehat', value: (total - sick).toLocaleString('id-ID'), sub: 'ekor terpantau baik' },
            { label: 'Sakit / Observasi', value: String(sick), sub: 'perlu penanganan' },
            { label: 'Kandang', value: String(animals.length), sub: 'unit aktif terkelola' },
          ].map((k) => (
            <div key={k.label} className="bg-card p-5 transition-colors hover:bg-moss-50">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">{k.label}</p>
              <p className="mt-2 font-display text-3xl font-extrabold tracking-tight">{k.value}</p>
              <p className="mt-1 text-xs font-semibold text-ink/50">{k.sub}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {animals.length === 0 ? (
        <EmptyState
          icon={<CowIcon className="h-6 w-6" />}
          title="Belum ada ternak tercatat"
          desc="Catat kelompok ternak pertama Anda untuk memantau populasi dan kesehatan."
          action={
            <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-leaf-600 px-4 py-2 text-sm font-bold text-paper transition-transform hover:-translate-y-0.5">
              <PlusIcon className="h-4 w-4" /> Tambah Ternak
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {animals.map((g, i) => {
            const healthyPct = g.count > 0 ? (g.count - g.sick) / g.count : 1;
            return (
              <Reveal key={g.id} delay={Math.min(i, 4) * 70}>
                <Card className="flex h-full flex-col p-5">
                  <div className="flex items-start gap-3.5">
                    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${speciesTone[g.species]}`}>
                      {speciesIcon[g.species]('h-6 w-6')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-lg font-bold leading-tight">{SPECIES_META[g.species].label}</h3>
                        <span className="rounded-full bg-ink/8 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-ink/55">{g.breed}</span>
                      </div>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-ink/50">
                        <BarnIcon className="h-3.5 w-3.5" /> {g.coop} · diperiksa {relDays(g.lastCheck)}
                      </p>
                    </div>
                    <Donut value={healthyPct} size={62} stroke={6} color={g.sick > 0 ? 'var(--color-hay-500)' : 'var(--color-leaf-500)'}>
                      <span className="text-[11px] font-extrabold tabular-nums">{Math.round(healthyPct * 100)}%</span>
                    </Donut>
                  </div>

                  <div className="mt-4 flex items-end gap-2">
                    <p className="font-display text-4xl font-extrabold leading-none tracking-tight">{g.count}</p>
                    <p className="pb-1 text-sm font-bold text-ink/45">{SPECIES_META[g.species].unit}</p>
                    {g.sick > 0 ? (
                      <span className="mb-0.5 ml-auto rounded-full bg-clay-100 px-2.5 py-1 text-[11px] font-extrabold text-clay-600">{g.sick} sakit</span>
                    ) : (
                      <span className="mb-0.5 ml-auto rounded-full bg-leaf-100 px-2.5 py-1 text-[11px] font-extrabold text-leaf-700">Semua sehat</span>
                    )}
                  </div>

                  {g.note && <p className="mt-3 rounded-lg bg-paper/80 px-3 py-2 text-xs font-semibold leading-relaxed text-ink/60">{g.note}</p>}

                  <div className="mt-4 flex items-center gap-2 border-t border-line pt-3.5">
                    <button
                      onClick={() => checkUp(g)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-moss-950 px-3 py-2 text-xs font-bold text-paper transition-all hover:-translate-y-0.5 hover:bg-moss-800"
                    >
                      Catat Pemeriksaan
                    </button>
                    <button onClick={() => openEdit(g)} title="Ubah" className="rounded-lg border border-line p-2 text-ink/55 transition-colors hover:border-moss-300 hover:text-ink">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => remove(g)} title="Hapus" className="rounded-lg border border-line p-2 text-ink/55 transition-colors hover:border-clay-300 hover:bg-clay-100 hover:text-clay-600">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              </Reveal>
            );
          })}
        </div>
      )}

      {/* ===== Modal ===== */}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Ubah Data Ternak' : 'Tambah Kelompok Ternak'}>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Jenis Ternak">
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(SPECIES_META) as Species[]).map((sp) => (
                <button
                  type="button"
                  key={sp}
                  onClick={() => setForm({ ...form, species: sp })}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs font-bold transition-all ${
                    form.species === sp ? 'border-leaf-600 bg-leaf-600 text-paper' : 'border-line bg-card text-ink/60 hover:border-leaf-400'
                  }`}
                >
                  {speciesIcon[sp]('h-5 w-5')}
                  {SPECIES_META[sp].label}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ras / Galur *">
              <input className={inputCls} value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} placeholder="cth. Peranakan Ongole" />
            </Field>
            <Field label="Kandang">
              <input className={inputCls} value={form.coop} onChange={(e) => setForm({ ...form, coop: e.target.value })} placeholder="cth. Kandang Utara" />
            </Field>
            <Field label="Jumlah (ekor)">
              <input type="number" min="0" className={inputCls} value={form.count} onChange={(e) => setForm({ ...form, count: Math.max(0, parseInt(e.target.value) || 0) })} />
            </Field>
            <Field label="Sakit / Observasi">
              <input type="number" min="0" className={inputCls} value={form.sick} onChange={(e) => setForm({ ...form, sick: Math.max(0, parseInt(e.target.value) || 0) })} />
            </Field>
          </div>
          <Field label="Catatan">
            <textarea rows={2} className={inputCls} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Riwayat vaksin, pakan, produksi…" />
          </Field>
          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-line px-4 py-2 text-sm font-bold text-ink/60 transition-colors hover:bg-moss-50">
              Batal
            </button>
            <button type="submit" className="rounded-lg bg-moss-950 px-5 py-2 text-sm font-bold text-paper transition-all hover:-translate-y-0.5 hover:bg-moss-800">
              {editing ? 'Simpan Perubahan' : 'Catat Ternak'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
