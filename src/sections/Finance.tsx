import { useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import { fmtDate, fmtIDR, fmtIDRk, monthlySeries, todayISO, uid, type Ledger, type Store } from '../lib';
import { ArrowDownIcon, ArrowUpIcon, ChartIcon, CoinsIcon, PlusIcon, SearchIcon, TrashIcon } from '../icons';
import { Card, CashBars, EmptyState, Field, inputCls, Modal, Reveal, SectionHead, Sparkline, useToast } from '../ui';

type Props = { store: Store; setStore: Dispatch<SetStateAction<Store>> };

const masukCats = ['Panen', 'Ternak', 'Lain-lain'];
const keluarCats = ['Pupuk & Benih', 'Pakan', 'Upah', 'Obat & Pestisida', 'Alat', 'Lain-lain'];

export default function Finance({ store, setStore }: Props) {
  const toast = useToast();
  const { ledger } = store;
  const [kindFilter, setKindFilter] = useState<'semua' | 'masuk' | 'keluar'>('semua');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ kind: 'masuk' as 'masuk' | 'keluar', note: '', cat: 'Panen', amount: 0, date: todayISO() });

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const series = useMemo(() => monthlySeries(ledger, 6), [ledger]);
  const cur = series[series.length - 1];
  const laba = cur.masuk - cur.keluar;
  const margin = cur.masuk > 0 ? (laba / cur.masuk) * 100 : 0;
  const netSeries = series.map((s) => s.masuk - s.keluar);

  const rows = useMemo(
    () =>
      ledger
        .filter((l) => (kindFilter === 'semua' || l.kind === kindFilter) && (l.note + l.cat).toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [ledger, kindFilter, q]
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.note.trim() || form.amount <= 0) {
      toast('Catatan dan jumlah wajib diisi dengan benar', 'err');
      return;
    }
    setStore((s) => ({ ...s, ledger: [...s.ledger, { id: uid(), ...form, note: form.note.trim() }] }));
    toast(`${form.kind === 'masuk' ? 'Pemasukan' : 'Pengeluaran'} ${fmtIDRk(form.amount)} dicatat`);
    setOpen(false);
    setForm({ kind: 'masuk', note: '', cat: 'Panen', amount: 0, date: todayISO() });
  };

  const remove = (l: Ledger) => {
    setStore((s) => ({ ...s, ledger: s.ledger.filter((x) => x.id !== l.id) }));
    toast('Transaksi dihapus', 'warn');
  };

  const setKind = (k: 'masuk' | 'keluar') =>
    setForm((f) => ({ ...f, kind: k, cat: k === 'masuk' ? masukCats[0] : keluarCats[0] }));

  return (
    <div>
      <SectionHead
        kicker="Modul Keuangan"
        title="Arus Kas Usaha Tani"
        desc="Catat hasil panen dan belanja sarana produksi — lihat laba bersih tiap bulan."
      >
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-moss-950 px-4 py-2.5 text-sm font-bold text-paper shadow-sm transition-all hover:-translate-y-0.5 hover:bg-moss-800 hover:shadow-md"
        >
          <PlusIcon className="h-4 w-4" /> Catat Transaksi
        </button>
      </SectionHead>

      {/* KPI */}
      <Reveal>
        <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
          <div className="bg-card p-5 transition-colors hover:bg-moss-50">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">Pemasukan Bulan Ini</p>
            <p className="mt-2 font-display text-2xl font-extrabold tracking-tight text-leaf-700 sm:text-3xl">{fmtIDRk(cur.masuk)}</p>
            <p className="mt-1 text-xs font-semibold text-ink/50">{ledger.filter((l) => l.kind === 'masuk' && l.date.startsWith(monthKey)).length} transaksi masuk</p>
          </div>
          <div className="bg-card p-5 transition-colors hover:bg-moss-50">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">Pengeluaran Bulan Ini</p>
            <p className="mt-2 font-display text-2xl font-extrabold tracking-tight text-clay-600 sm:text-3xl">{fmtIDRk(cur.keluar)}</p>
            <p className="mt-1 text-xs font-semibold text-ink/50">{ledger.filter((l) => l.kind === 'keluar' && l.date.startsWith(monthKey)).length} transaksi keluar</p>
          </div>
          <div className="bg-card p-5 transition-colors hover:bg-moss-50">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">Laba Bersih</p>
            <p className={`mt-2 flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl ${laba >= 0 ? 'text-leaf-700' : 'text-clay-600'}`}>
              {laba >= 0 ? <ArrowUpIcon className="h-5 w-5" /> : <ArrowDownIcon className="h-5 w-5" />}
              {fmtIDRk(Math.abs(laba))}
            </p>
            <p className="mt-1 text-xs font-semibold text-ink/50">{laba >= 0 ? 'surplus' : 'defisit'} bulan berjalan</p>
          </div>
          <div className="bg-card p-5 transition-colors hover:bg-moss-50">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">Margin Usaha</p>
            <p className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{margin.toLocaleString('id-ID', { maximumFractionDigits: 0 })}%</p>
            <Sparkline data={netSeries} className="mt-2 h-7 w-full" stroke={netSeries[netSeries.length - 1] >= 0 ? 'var(--color-leaf-500)' : 'var(--color-clay-500)'} />
          </div>
        </div>
      </Reveal>

      {/* grafik */}
      <Reveal delay={60}>
        <Card className="mb-6 p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-moss-950 text-leaf-300"><ChartIcon className="h-4 w-4" /></span>
              <div>
                <h3 className="font-display text-lg font-bold leading-tight">Pemasukan vs Pengeluaran</h3>
                <p className="text-xs text-ink/50">6 bulan terakhir · arahkan kursor ke batang untuk detail</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-bold text-ink/55">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-leaf-500" /> Pemasukan</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-clay-400" /> Pengeluaran</span>
            </div>
          </div>
          <CashBars data={series} height={185} />
        </Card>
      </Reveal>

      {/* buku kas */}
      <Reveal delay={90}>
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3.5">
            <h3 className="mr-2 font-display text-base font-bold">Buku Kas</h3>
            <div className="flex gap-1.5">
              {(['semua', 'masuk', 'keluar'] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setKindFilter(k)}
                  className={`rounded-full border px-3 py-1 text-xs font-bold capitalize transition-all hover:-translate-y-0.5 ${
                    kindFilter === k ? 'border-moss-950 bg-moss-950 text-paper' : 'border-line bg-card text-ink/60'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
            <div className="relative ml-auto w-full sm:w-60">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari transaksi…" className={`${inputCls} pl-9`} />
            </div>
          </div>
          {rows.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={<CoinsIcon className="h-6 w-6" />} title="Belum ada transaksi" desc="Catat pemasukan panen atau pengeluaran sarana produksi pertama Anda." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-paper/70 text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink/45">
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Catatan</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Jenis</th>
                    <th className="px-4 py-3 text-right">Jumlah</th>
                    <th className="w-14 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((l) => (
                    <tr key={l.id} className="group border-b border-line/70 transition-colors last:border-0 hover:bg-moss-50/70">
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-ink/55">{fmtDate(l.date)}</td>
                      <td className="px-4 py-3 font-bold">{l.note}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-ink/8 px-2.5 py-1 text-[10px] font-extrabold uppercase text-ink/55">{l.cat}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${l.kind === 'masuk' ? 'bg-leaf-100 text-leaf-700' : 'bg-clay-100 text-clay-600'}`}>
                          {l.kind === 'masuk' ? 'Masuk' : 'Keluar'}
                        </span>
                      </td>
                      <td className={`whitespace-nowrap px-4 py-3 text-right font-extrabold tabular-nums ${l.kind === 'masuk' ? 'text-leaf-700' : 'text-clay-600'}`}>
                        {l.kind === 'masuk' ? '+' : '−'} {fmtIDR(l.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => remove(l)}
                          title="Hapus"
                          className="rounded-lg border border-line p-1.5 text-ink/40 opacity-0 transition-all hover:border-clay-300 hover:bg-clay-100 hover:text-clay-600 group-hover:opacity-100"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </Reveal>

      {/* ===== Modal ===== */}
      <Modal open={open} onClose={() => setOpen(false)} title="Catat Transaksi">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Jenis Transaksi">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setKind('masuk')}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-bold transition-all ${
                  form.kind === 'masuk' ? 'border-leaf-600 bg-leaf-600 text-paper' : 'border-line bg-card text-ink/60 hover:border-leaf-400'
                }`}
              >
                <ArrowUpIcon className="h-4 w-4" /> Pemasukan
              </button>
              <button
                type="button"
                onClick={() => setKind('keluar')}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-bold transition-all ${
                  form.kind === 'keluar' ? 'border-clay-500 bg-clay-500 text-paper' : 'border-line bg-card text-ink/60 hover:border-clay-300'
                }`}
              >
                <ArrowDownIcon className="h-4 w-4" /> Pengeluaran
              </button>
            </div>
          </Field>
          <Field label="Catatan *">
            <input className={inputCls} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder={form.kind === 'masuk' ? 'cth. Jual cabai ke pasar induk' : 'cth. Beli pupuk NPK 2 zak'} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kategori">
              <select className={inputCls} value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })}>
                {(form.kind === 'masuk' ? masukCats : keluarCats).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Tanggal">
              <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Field>
          </div>
          <Field label="Jumlah (Rp) *">
            <input type="number" min="0" step="1000" className={inputCls} value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} placeholder="cth. 2500000" />
          </Field>
          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-line px-4 py-2 text-sm font-bold text-ink/60 transition-colors hover:bg-moss-50">
              Batal
            </button>
            <button type="submit" className="rounded-lg bg-moss-950 px-5 py-2 text-sm font-bold text-paper transition-all hover:-translate-y-0.5 hover:bg-moss-800">
              Simpan Transaksi
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
