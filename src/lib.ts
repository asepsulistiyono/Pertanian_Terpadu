/* ================= Tipe Data ================= */

export type Stage = 'persemaian' | 'vegetatif' | 'generatif' | 'siap-panen';
export type TaskCat = 'irigasi' | 'pemupukan' | 'panen' | 'perawatan' | 'ternak' | 'umum';
export type InvCat = 'pupuk' | 'benih' | 'pakan' | 'pestisida' | 'alat';
export type Species = 'sapi' | 'kambing' | 'ayam' | 'bebek';
export type Tab = 'ringkasan' | 'tanaman' | 'ternak' | 'agenda' | 'gudang' | 'keuangan';

export interface Crop {
  id: string;
  name: string;
  variety: string;
  plot: string;
  area: number;
  plantDate: string;
  harvestEst: string;
  stage: Stage;
  progress: number;
  health: number;
  color: string;
}
export interface AnimalGroup {
  id: string;
  species: Species;
  breed: string;
  count: number;
  sick: number;
  coop: string;
  lastCheck: string;
  note: string;
}
export interface Task {
  id: string;
  title: string;
  cat: TaskCat;
  date: string;
  priority: 1 | 2 | 3;
  done: boolean;
}
export interface InvItem {
  id: string;
  name: string;
  cat: InvCat;
  unit: string;
  stock: number;
  min: number;
  loc: string;
}
export interface Ledger {
  id: string;
  kind: 'masuk' | 'keluar';
  note: string;
  cat: string;
  amount: number;
  date: string;
}
export interface Store {
  crops: Crop[];
  animals: AnimalGroup[];
  tasks: Task[];
  inv: InvItem[];
  ledger: Ledger[];
}

/* ================= Util ================= */

export const uid = () =>
  Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
};

export const addDays = (iso: string, days: number) => {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
};

export const daysUntil = (iso: string) =>
  Math.round(
    (new Date(iso + 'T12:00:00').getTime() - new Date(todayISO() + 'T12:00:00').getTime()) /
      86400000
  );

export const fmtDate = (iso: string) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const fmtShort = (iso: string) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

export const relDays = (iso: string) => {
  const n = daysUntil(iso);
  if (n === 0) return 'hari ini';
  if (n === 1) return 'besok';
  if (n === -1) return 'kemarin';
  return n > 0 ? `${n} hari lagi` : `${-n} hari lalu`;
};

export const fmtIDR = (n: number) => 'Rp' + n.toLocaleString('id-ID');
export const fmtIDRk = (n: number) =>
  n >= 1000000
    ? 'Rp' + (n / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' jt'
    : fmtIDR(n);

const monthDate = (offset: number, day: number) => {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const maxDay = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  base.setDate(Math.min(day, maxDay));
  if (offset === 0 && base > now) base.setDate(now.getDate());
  return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(
    base.getDate()
  ).padStart(2, '0')}`;
};

export function monthlySeries(ledger: Ledger[], back = 6) {
  const out: { label: string; masuk: number; keluar: number }[] = [];
  const now = new Date();
  for (let i = back - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('id-ID', { month: 'short' });
    let masuk = 0;
    let keluar = 0;
    for (const l of ledger) {
      if (l.date.startsWith(key)) {
        if (l.kind === 'masuk') masuk += l.amount;
        else keluar += l.amount;
      }
    }
    out.push({ label, masuk, keluar });
  }
  return out;
}

/* ================= Metadata ================= */

export const STAGES: Record<Stage, { label: string; at: number }> = {
  persemaian: { label: 'Persemaian', at: 10 },
  vegetatif: { label: 'Vegetatif', at: 40 },
  generatif: { label: 'Generatif', at: 70 },
  'siap-panen': { label: 'Siap Panen', at: 95 },
};
export const STAGE_ORDER: Stage[] = ['persemaian', 'vegetatif', 'generatif', 'siap-panen'];

export const TASK_META: Record<TaskCat, { label: string; chip: string }> = {
  irigasi: { label: 'Irigasi', chip: 'bg-air-100 text-air-700' },
  pemupukan: { label: 'Pemupukan', chip: 'bg-hay-100 text-hay-700' },
  panen: { label: 'Panen', chip: 'bg-leaf-100 text-leaf-700' },
  perawatan: { label: 'Perawatan', chip: 'bg-moss-100 text-moss-700' },
  ternak: { label: 'Ternak', chip: 'bg-clay-100 text-clay-700' },
  umum: { label: 'Umum', chip: 'bg-ink/10 text-ink/70' },
};

export const PRIORITY_META: Record<1 | 2 | 3, { label: string; cls: string }> = {
  1: { label: 'Tinggi', cls: 'text-clay-600' },
  2: { label: 'Sedang', cls: 'text-hay-600' },
  3: { label: 'Rendah', cls: 'text-ink/45' },
};

export const INV_META: Record<InvCat, { label: string; chip: string }> = {
  pupuk: { label: 'Pupuk', chip: 'bg-leaf-100 text-leaf-700' },
  benih: { label: 'Benih', chip: 'bg-hay-100 text-hay-700' },
  pakan: { label: 'Pakan', chip: 'bg-air-100 text-air-700' },
  pestisida: { label: 'Pestisida', chip: 'bg-clay-100 text-clay-700' },
  alat: { label: 'Alat', chip: 'bg-moss-100 text-moss-700' },
};

export const SPECIES_META: Record<Species, { label: string; unit: string }> = {
  sapi: { label: 'Sapi', unit: 'ekor' },
  kambing: { label: 'Kambing', unit: 'ekor' },
  ayam: { label: 'Ayam', unit: 'ekor' },
  bebek: { label: 'Bebek', unit: 'ekor' },
};

export const PLOT_OPTIONS = ['A-1', 'A-2', 'B-1', 'B-2', 'C-1', 'C-2', 'D-1', 'D-2', 'E-1', 'E-2'];
export const CROP_COLORS = ['#6d8a42', '#97ba4e', '#b95638', '#d9a83e', '#4287a6', '#7d5a7c', '#8a6d3b'];

export const TICKER = [
  { name: 'Gabah Kering Panen', price: 'Rp6.450/kg', up: true, pct: '1,8%' },
  { name: 'Jagung Pipil Kering', price: 'Rp5.150/kg', up: false, pct: '0,6%' },
  { name: 'Cabai Rawit Merah', price: 'Rp42.300/kg', up: true, pct: '4,2%' },
  { name: 'Bawang Merah', price: 'Rp28.900/kg', up: false, pct: '1,1%' },
  { name: 'Kedelai Lokal', price: 'Rp10.800/kg', up: true, pct: '0,4%' },
  { name: 'Telur Ayam Kampung', price: 'Rp3.200/butir', up: true, pct: '0,9%' },
  { name: 'Kambing Hidup', price: 'Rp78.000/kg', up: true, pct: '2,3%' },
  { name: 'Pupuk Urea Non-subsidi', price: 'Rp5.400/kg', up: false, pct: '0,2%' },
];

/* ================= Data Awal ================= */

const T = todayISO();

export const seedStore: Store = {
  crops: [
    { id: 'c1', name: 'Padi', variety: 'Inpari 32', plot: 'A-1', area: 4.2, plantDate: addDays(T, -55), harvestEst: addDays(T, 35), stage: 'generatif', progress: 72, health: 92, color: '#8aa45d' },
    { id: 'c2', name: 'Padi (MT-2)', variety: 'Inpari 32', plot: 'A-2', area: 3.4, plantDate: addDays(T, -10), harvestEst: addDays(T, 95), stage: 'persemaian', progress: 10, health: 98, color: '#b8d47a' },
    { id: 'c3', name: 'Jagung Manis', variety: 'Talenta F1', plot: 'B-1', area: 2.8, plantDate: addDays(T, -40), harvestEst: addDays(T, 25), stage: 'generatif', progress: 64, health: 88, color: '#d9a83e' },
    { id: 'c4', name: 'Cabai Rawit', variety: 'Dewata F1', plot: 'C-1', area: 1.2, plantDate: addDays(T, -70), harvestEst: addDays(T, 6), stage: 'siap-panen', progress: 95, health: 76, color: '#b95638' },
    { id: 'c5', name: 'Tomat', variety: 'Servo F1', plot: 'C-2', area: 0.9, plantDate: addDays(T, -30), harvestEst: addDays(T, 40), stage: 'vegetatif', progress: 45, health: 90, color: '#cd7455' },
    { id: 'c6', name: 'Kacang Panjang', variety: 'Parade Tavi', plot: 'D-1', area: 0.8, plantDate: addDays(T, -20), harvestEst: addDays(T, 30), stage: 'vegetatif', progress: 32, health: 95, color: '#5f8221' },
    { id: 'c7', name: 'Terong', variety: 'Mustang F1', plot: 'D-2', area: 0.6, plantDate: addDays(T, -12), harvestEst: addDays(T, 55), stage: 'vegetatif', progress: 16, health: 97, color: '#7d5a7c' },
  ],
  animals: [
    { id: 'a1', species: 'sapi', breed: 'Peranakan Ongole', count: 14, sick: 1, coop: 'Kandang Utara', lastCheck: addDays(T, -2), note: '1 ekor flu ringan — sudah diberi obat herbal.' },
    { id: 'a2', species: 'kambing', breed: 'Boerka', count: 28, sick: 0, coop: 'Kandang Timur', lastCheck: addDays(T, -5), note: 'Rutin garam jilat dan vitamin mingguan.' },
    { id: 'a3', species: 'ayam', breed: 'Kampung Unggul (KUB)', count: 240, sick: 6, coop: 'Kandang Unggas', lastCheck: addDays(T, -1), note: 'Vaksin ND lanjutan dijadwalkan minggu ini.' },
    { id: 'a4', species: 'bebek', breed: 'Tegal', count: 85, sick: 0, coop: 'Kolam Selatan', lastCheck: addDays(T, -8), note: 'Produksi telur stabil 68 butir/hari.' },
  ],
  tasks: [
    { id: 't1', title: 'Panen cabai C-1 gelombang pertama', cat: 'panen', date: T, priority: 1, done: false },
    { id: 't2', title: 'Irigasi petak A-1 (pompa 2, ±3 jam)', cat: 'irigasi', date: T, priority: 2, done: false },
    { id: 't3', title: 'Beli pakan konsentrat — stok kritis', cat: 'umum', date: T, priority: 1, done: false },
    { id: 't4', title: 'Pemupukan susulan jagung B-1 (NPK)', cat: 'pemupukan', date: addDays(T, 1), priority: 2, done: false },
    { id: 't5', title: 'Semprot pestisida nabati tomat C-2', cat: 'perawatan', date: addDays(T, 1), priority: 2, done: false },
    { id: 't6', title: 'Vaksinasi ND ayam kampung', cat: 'ternak', date: addDays(T, 2), priority: 1, done: false },
    { id: 't7', title: 'Penyiangan gulma kacang panjang D-1', cat: 'perawatan', date: addDays(T, 3), priority: 3, done: false },
    { id: 't8', title: 'Perbaiki saluran irigasi blok D', cat: 'umum', date: addDays(T, 5), priority: 3, done: false },
    { id: 't9', title: 'Pindah tanam bibit padi ke A-2', cat: 'perawatan', date: addDays(T, -1), priority: 2, done: true },
    { id: 't10', title: 'Setor telur ke koperasi unit desa', cat: 'ternak', date: addDays(T, -2), priority: 2, done: true },
  ],
  inv: [
    { id: 'i1', name: 'Pupuk Urea', cat: 'pupuk', unit: 'kg', stock: 180, min: 100, loc: 'Gudang A' },
    { id: 'i2', name: 'NPK Phonska', cat: 'pupuk', unit: 'kg', stock: 60, min: 120, loc: 'Gudang A' },
    { id: 'i3', name: 'Pupuk Kandang Fermentasi', cat: 'pupuk', unit: 'kg', stock: 900, min: 200, loc: 'Gudang B' },
    { id: 'i4', name: 'Benih Padi Inpari 32', cat: 'benih', unit: 'kg', stock: 45, min: 20, loc: 'Rak Benih' },
    { id: 'i5', name: 'Benih Jagung Talenta', cat: 'benih', unit: 'kg', stock: 8, min: 10, loc: 'Rak Benih' },
    { id: 'i6', name: 'Pakan Konsentrat Sapi', cat: 'pakan', unit: 'kg', stock: 40, min: 150, loc: 'Gudang Pakan' },
    { id: 'i7', name: 'Dedak Padi', cat: 'pakan', unit: 'kg', stock: 260, min: 100, loc: 'Gudang Pakan' },
    { id: 'i8', name: 'Pestisida Nabati Neem', cat: 'pestisida', unit: 'L', stock: 12, min: 5, loc: 'Lemari Obat' },
    { id: 'i9', name: 'Handsprayer 16 L', cat: 'alat', unit: 'unit', stock: 3, min: 2, loc: 'Bengkel' },
  ],
  ledger: [
    { id: 'l01', kind: 'masuk', note: 'Panen gabah petak A-1', cat: 'Panen', amount: 42500000, date: monthDate(-5, 14) },
    { id: 'l02', kind: 'keluar', note: 'Pupuk & benih musim tanam', cat: 'Pupuk & Benih', amount: 9800000, date: monthDate(-5, 5) },
    { id: 'l03', kind: 'keluar', note: 'Upah buruh tanam (12 HOK)', cat: 'Upah', amount: 6500000, date: monthDate(-5, 20) },
    { id: 'l04', kind: 'masuk', note: 'Jual jagung manis ke pasar induk', cat: 'Panen', amount: 18200000, date: monthDate(-4, 11) },
    { id: 'l05', kind: 'masuk', note: 'Telur ayam & bebek (mingguan)', cat: 'Ternak', amount: 3400000, date: monthDate(-4, 22) },
    { id: 'l06', kind: 'keluar', note: 'Pakan ternak bulanan', cat: 'Pakan', amount: 7200000, date: monthDate(-4, 7) },
    { id: 'l07', kind: 'masuk', note: 'Panen tomat petak C-2', cat: 'Panen', amount: 15600000, date: monthDate(-3, 16) },
    { id: 'l08', kind: 'masuk', note: 'Jual kambing 4 ekor', cat: 'Ternak', amount: 12000000, date: monthDate(-3, 25) },
    { id: 'l09', kind: 'keluar', note: 'Perbaikan pompa irigasi', cat: 'Alat', amount: 2750000, date: monthDate(-3, 9) },
    { id: 'l10', kind: 'masuk', note: 'Panen kacang panjang', cat: 'Panen', amount: 9800000, date: monthDate(-2, 13) },
    { id: 'l11', kind: 'masuk', note: 'Telur ayam & bebek (mingguan)', cat: 'Ternak', amount: 3650000, date: monthDate(-2, 24) },
    { id: 'l12', kind: 'keluar', note: 'Pestisida & obat ternak', cat: 'Obat & Pestisida', amount: 1950000, date: monthDate(-2, 6) },
    { id: 'l13', kind: 'masuk', note: 'Panen cabai gelombang awal', cat: 'Panen', amount: 21400000, date: monthDate(-1, 18) },
    { id: 'l14', kind: 'keluar', note: 'Upah petik cabai', cat: 'Upah', amount: 4300000, date: monthDate(-1, 19) },
    { id: 'l15', kind: 'keluar', note: 'Pakan konsentrat sapi', cat: 'Pakan', amount: 5100000, date: monthDate(-1, 8) },
    { id: 'l16', kind: 'masuk', note: 'Telur ayam kampung', cat: 'Ternak', amount: 3900000, date: monthDate(0, 4) },
    { id: 'l17', kind: 'masuk', note: 'Jual sayur lokal ke koperasi', cat: 'Panen', amount: 5200000, date: monthDate(0, 9) },
    { id: 'l18', kind: 'keluar', note: 'Bibit & polybag persemaian', cat: 'Pupuk & Benih', amount: 1250000, date: monthDate(0, 3) },
  ],
};
