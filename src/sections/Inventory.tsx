import { useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import { INV_META, uid, type InvCat, type InvItem, type Store } from '../lib';
import { BoxIcon, PencilIcon, PlusIcon, SearchIcon, TrashIcon } from '../icons';
import { Card, EmptyState, Field, inputCls, Modal, ProgressBar, Reveal, SectionHead, useToast } from '../ui';

type Props = { store: Store; setStore: Dispatch<SetStateAction<Store>> };

const statusOf = (i: InvItem) => {
  if (i.stock <= 0) return { label: 'Habis', chip: 'bg-clay-500 text-paper', color: 'var(--color-clay-500)' };
  if (i.stock <= i.min) return { label: 'Menipis', chip: 'bg-clay-100 text-clay-600', color: 'var(--color-clay-500)' };
  if (i.stock <= i.min * 1.5) return { label: 'Perhatian', chip: 'bg-hay-100 text-hay-700', color: 'var(--color-hay-500)' };
  return { label: 'Aman', chip: 'bg-leaf-100 text-leaf-700', color: 'var(--color-leaf-500)' };
};

const emptyForm = { name: '', cat: 'pupuk' as InvCat, unit: 'kg', stock: 0, min: 10, loc: 'Gudang A' };

export default function Inventory({ store, setStore }: Props) {
  const toast = useToast();
  const { inv } = store;
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<'semua' | InvCat>('semua');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InvItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(
    () =>
      inv
        .filter((i) => (cat === 'semua' || i.cat === cat) && (i.name + i.loc).toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => a.stock / Math.max(a.min, 1) - b.stock / Math.max(b.min, 1)),
    [inv, q, cat]
  );

  const low = inv.filter((i) => i.stock <= i.min).length;

  const adjust = (i: InvItem, delta: number) => {
    const next = Math.max(0, i.stock + delta);
    setStore((s) => ({ ...s, inv: s.inv.map((x) => (x.id === i.id ? { ...x, stock: next } : x)) }));
    if (next <= i.min && i.stock > i.min) toast(`Stok ${i.name} turun di bawah minimum`, 'warn');
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };
  const openEdit = (i: InvItem) => {
    setEditing(i);
    setForm({ name: i.name, cat: i.cat, unit: i.unit, stock: i.stock, min: i.min, loc: i.loc });
    setOpen(true);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast('Nama barang wajib diisi', 'err');
      return;
    }
    if (editing) {
      setStore((s) => ({ ...s, inv: s.inv.map((x) => (x.id === editing.id ? { ...x, ...form, name: form.name.trim() } : x)) }));
      toast('Data gudang diperbarui');
    } else {
      setStore((s) => ({ ...s, inv: [...s.inv, { id: uid(), ...form, name: form.name.trim() }] }));
      toast(`${form.name} masuk catatan gudang`);
    }
    setOpen(false);
  };

  const remove = (i: InvItem) => {
    setStore((s) => ({ ...s, inv: s.inv.filter((x) => x.id !== i.id) }));
    toast(`${i.name} dihapus dari gudang`, 'warn');
  };

  return (
    <div>
      <SectionHead
        kicker="Modul Gudang"
        title="Inventaris & Stok"
        desc="Pupuk, benih, pakan, dan alat — pantau batas minimum agar produksi tidak terhenti."
      >
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-moss-950 px-4 py-2.5 text-sm font-bold text-paper shadow-sm transition-all hover:-translate-y-0.5 hover:bg-moss-800 hover:shadow-md"
        >
          <PlusIcon className="h-4 w-4" /> Tambah Barang
        </button>
      </SectionHead>

      {low > 0 && (
        <Reveal>
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-clay-200 bg-clay-100/60 px-4 py-3">
            <span className="animate-pip h-2.5 w-2.5 shrink-0 rounded-full bg-clay-500" />
            <p className="text-sm font-bold text-clay-700">
              {low} barang di bawah stok minimum — segera jadwalkan pembelian agar agenda pemupukan & pakan tidak terganggu.
            </p>
          </div>
        </Reveal>
      )}

      <Reveal>
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari barang atau lokasi…" className={`${inputCls} pl-9`} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(['semua', ...Object.keys(INV_META)] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCat(c as 'semua' | InvCat)}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-all hover:-translate-y-0.5 ${
                  cat === c ? 'border-moss-950 bg-moss-950 text-paper' : 'border-line bg-card text-ink/60 hover:border-moss-300'
                }`}
              >
                {c === 'semua' ? 'Semua' : INV_META[c as InvCat].label}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<BoxIcon className="h-6 w-6" />}
          title="Gudang kosong di kategori ini"
          desc="Catat barang pertama: pupuk, benih, pakan ternak, atau peralatan."
          action={
            <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-leaf-600 px-4 py-2 text-sm font-bold text-paper transition-transform hover:-translate-y-0.5">
              <PlusIcon className="h-4 w-4" /> Tambah Barang
            </button>
          }
        />
      ) : (
        <Reveal>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-paper/70 text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink/45">
                    <th className="px-4 py-3">Barang</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Lokasi</th>
                    <th className="px-4 py-3">Stok</th>
                    <th className="w-44 px-4 py-3">Level</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((i) => {
                    const st = statusOf(i);
                    const pct = i.min > 0 ? (i.stock / (i.min * 2)) * 100 : 100;
                    return (
                      <tr key={i.id} className="group border-b border-line/70 transition-colors last:border-0 hover:bg-moss-50/70">
                        <td className="px-4 py-3 font-bold">{i.name}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${INV_META[i.cat].chip}`}>
                            {INV_META[i.cat].label}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-ink/55">{i.loc}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => adjust(i, -1)}
                              className="flex h-6 w-6 items-center justify-center rounded-md border border-line font-extrabold text-ink/50 transition-all hover:border-clay-300 hover:bg-clay-100 hover:text-clay-600"
                            >
                              −
                            </button>
                            <span className="w-16 text-center font-extrabold tabular-nums">
                              {i.stock} <span className="text-[10px] font-bold text-ink/40">{i.unit}</span>
                            </span>
                            <button
                              onClick={() => adjust(i, +1)}
                              className="flex h-6 w-6 items-center justify-center rounded-md border border-line font-extrabold text-ink/50 transition-all hover:border-leaf-400 hover:bg-leaf-100 hover:text-leaf-700"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <ProgressBar value={pct} color={st.color} />
                          <p className="mt-1 text-[10px] font-bold text-ink/40">min. {i.min} {i.unit}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${st.chip}`}>{st.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                            <button onClick={() => openEdit(i)} title="Ubah" className="rounded-lg border border-line p-1.5 text-ink/55 transition-colors hover:border-moss-300 hover:text-ink">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button onClick={() => remove(i)} title="Hapus" className="rounded-lg border border-line p-1.5 text-ink/55 transition-colors hover:border-clay-300 hover:bg-clay-100 hover:text-clay-600">
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </Reveal>
      )}

      {/* ===== Modal ===== */}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Ubah Barang Gudang' : 'Tambah Barang Gudang'}>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Nama Barang *">
            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="cth. NPK Phonska" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kategori">
              <select className={inputCls} value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value as InvCat })}>
                {(Object.keys(INV_META) as InvCat[]).map((c) => (
                  <option key={c} value={c}>{INV_META[c].label}</option>
                ))}
              </select>
            </Field>
            <Field label="Satuan">
              <select className={inputCls} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                {['kg', 'L', 'unit', 'zak', 'butir', 'botol'].map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </Field>
            <Field label="Stok Saat Ini">
              <input type="number" min="0" className={inputCls} value={form.stock} onChange={(e) => setForm({ ...form, stock: Math.max(0, parseFloat(e.target.value) || 0) })} />
            </Field>
            <Field label="Batas Minimum">
              <input type="number" min="0" className={inputCls} value={form.min} onChange={(e) => setForm({ ...form, min: Math.max(0, parseFloat(e.target.value) || 0) })} />
            </Field>
          </div>
          <Field label="Lokasi Simpan">
            <input className={inputCls} value={form.loc} onChange={(e) => setForm({ ...form, loc: e.target.value })} placeholder="cth. Gudang A" />
          </Field>
          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-line px-4 py-2 text-sm font-bold text-ink/60 transition-colors hover:bg-moss-50">
              Batal
            </button>
            <button type="submit" className="rounded-lg bg-moss-950 px-5 py-2 text-sm font-bold text-paper transition-all hover:-translate-y-0.5 hover:bg-moss-800">
              {editing ? 'Simpan Perubahan' : 'Simpan ke Gudang'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
