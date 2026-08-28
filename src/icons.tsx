/* Ikon SVG kustom TaniPadu — digambar sebagai garis 24x24 */

type P = { className?: string };

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const GridIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><rect x="3" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" /></svg>
);

export const SproutIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><path d="M12 21v-8" /><path d="M12 13C12 8 8.5 5.5 4 5.5 4 11 8 13.5 12 13z" /><path d="M12 10c0-4 3-6 7-6 0 5-3 7-7 6z" /></svg>
);

export const WheatIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><path d="M12 21V9" /><path d="M12 12c-1.8-.4-3-2-3-4.5C10.8 8 12 9.5 12 12z" /><path d="M12 12c1.8-.4 3-2 3-4.5C13.2 8 12 9.5 12 12z" /><path d="M12 16c-1.8-.4-3-2-3-4.5 1.8.5 3 2 3 4.5z" /><path d="M12 16c1.8-.4 3-2 3-4.5-1.8.5-3 2-3 4.5z" /><path d="M12 20c-1.8-.4-3-2-3-4.5 1.8.5 3 2 3 4.5z" /><path d="M12 20c1.8-.4 3-2 3-4.5-1.8.5-3 2-3 4.5z" /></svg>
);

export const LeafIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><path d="M20 4c-9.5 0-15.5 5-15.5 12 0 1.9.6 3.4 1.2 4C9.5 11 14.5 7.5 20 6.5" /><path d="M20 4c0 9-4.5 15-11.5 15-1.1 0-2.1-.2-2.8-.5" /></svg>
);

export const DropIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z" /></svg>
);

export const SunIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.4 1.4M17.6 17.6L19 19M19 5l-1.4 1.4M6.4 17.6L5 19" /></svg>
);

export const SunCloudIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><circle cx="8" cy="7.5" r="3" /><path d="M8 2.5v1.2M3.6 4.1l.9.9M2.5 9h1.3" /><path d="M9.5 19.5a4 4 0 1 1 .7-7.9 5 5 0 0 1 9.6 1.6 3.1 3.1 0 0 1-1.3 6.3H9.5z" /></svg>
);

export const WindIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><path d="M3 8.5h9.5a2.5 2.5 0 1 0-2.4-3.2" /><path d="M3 12.5h14.5a2.5 2.5 0 1 1-2.4 3.2" /><path d="M3 16.5h6a2 2 0 1 1-1.9 2.6" /></svg>
);

export const CoinsIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><ellipse cx="9" cy="6" rx="6.5" ry="3" /><path d="M2.5 6v5.5c0 1.7 2.9 3 6.5 3s6.5-1.3 6.5-3V6" /><path d="M2.5 11.5V17c0 1.7 2.9 3 6.5 3s6.5-1.3 6.5-3v-5.5" /><path d="M15.8 8.4c3.3.3 5.7 1.6 5.7 3.1v5.5c0 1.5-2.4 2.8-5.7 3.1" /></svg>
);

export const CalendarIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10.5h18" /></svg>
);

export const ClipboardIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><rect x="5" y="4.5" width="14" height="17" rx="2" /><rect x="9" y="2.5" width="6" height="4" rx="1" /><path d="M9 14l2.2 2.2L15.5 12" /></svg>
);

export const BoxIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" /><path d="M3 8l9 5 9-5" /><path d="M12 13v8" /></svg>
);

export const CowIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><path d="M7.5 5.5C6.5 3.8 5 3 3.5 3c0 2 .7 3.6 2.3 4.4" /><path d="M16.5 5.5c1-1.7 2.5-2.5 4-2.5 0 2-.7 3.6-2.3 4.4" /><path d="M7.5 5.5h9a3 3 0 0 1 3 3V13a6.5 6.5 0 0 1-6.5 6.5A6.5 6.5 0 0 1 6.5 13V8.5a3 3 0 0 1 3-3z" /><path d="M9.5 10.2h.01M14.5 10.2h.01M10.2 15.5h.01M13.8 15.5h.01" strokeWidth="2.4" /></svg>
);

export const GoatIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><path d="M9.5 4.8C9 3.2 9.5 1.9 10.6 1.3" /><path d="M14.5 4.8c.5-1.6 0-2.9-1.1-3.5" /><path d="M9.5 4.8h5l2.3 4.2v3.8a4.8 4.8 0 0 1-9.6 0V9L9.5 4.8z" /><path d="M12 17.6V21" /><path d="M10 10.5h.01M14 10.5h.01" strokeWidth="2.4" /></svg>
);

export const ChickenIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><path d="M13.8 3.2c.5-.9 1.8-.9 2.3 0" /><path d="M14 3.8a2.8 2.8 0 0 1 5.2 1.5c0 .9-.4 1.7-1.1 2.2.6 1 .9 2.1.9 3.2a6.8 6.8 0 0 1-6.8 6.8H8A4.7 4.7 0 0 1 3.3 12.8C3.3 8.8 6.4 6 10.4 5.7l1.2-.1A2.8 2.8 0 0 1 14 3.8z" /><path d="M19.2 5.5l2.3.7-2.1 1" /><path d="M9 17.5v3M12.2 17.5v3" /><path d="M16.4 5.6h.01" strokeWidth="2.4" /></svg>
);

export const DuckIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><path d="M12.5 3.5a2.6 2.6 0 0 1 2.6 2.6c0 .4.3.8.7 1l2.7 1-2.7 1c-.4.2-.7.6-.7 1a6.1 6.1 0 0 1-6.1 6.1H7.5A4.5 4.5 0 0 1 3 11.7c0-3.6 3-6.1 6.6-6.1h.4a2.6 2.6 0 0 1 2.5-2.1z" /><path d="M14.6 6.3h.01" strokeWidth="2.4" /><path d="M3 20c1.5.9 3 .9 4.5 0s3-.9 4.5 0 3 .9 4.5 0 3-.9 4.5 0" /></svg>
);

export const BellIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><path d="M18 8.5a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" /><path d="M10.3 20.5a2 2 0 0 0 3.4 0" /></svg>
);

export const PlusIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><path d="M12 5v14M5 12h14" /></svg>
);

export const TrashIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><path d="M3.5 6.5h17" /><path d="M8.5 6.5v-2a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v2" /><path d="M19 6.5l-.9 13.1a2 2 0 0 1-2 1.9H7.9a2 2 0 0 1-2-1.9L5 6.5" /><path d="M10 11v6M14 11v6" /></svg>
);

export const PencilIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><path d="M17 3.5a2.6 2.6 0 1 1 3.7 3.7L7.5 20.4 2.5 21.5l1.1-5L17 3.5z" /></svg>
);

export const XIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><path d="M18 6L6 18M6 6l12 12" /></svg>
);

export const CheckIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><path d="M20 6L9 17l-5-5" /></svg>
);

export const ArrowUpIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><path d="M7 17L17 7M8.5 7H17v8.5" /></svg>
);

export const ArrowDownIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><path d="M7 7l10 10M17 8.5V17H8.5" /></svg>
);

export const SearchIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
);

export const ChartIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><path d="M3.5 3.5v17h17" /><path d="M8 16.5v-4M12.5 16.5V7M17 16.5v-6.5" /></svg>
);

export const ResetIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><path d="M3.5 12a8.5 8.5 0 1 0 2.8-6.3L3.5 8" /><path d="M3.5 3.5V8H8" /></svg>
);

export const ChevronRightIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><path d="M9 18l6-6-6-6" /></svg>
);

export const FlagIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><path d="M5 21.5V4c3.5-1.8 7 1.8 10.5 0v10c-3.5 1.8-7-1.8-10.5 0" /></svg>
);

export const BarnIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><path d="M3.5 21V10L12 3l8.5 7v11" /><path d="M9 21v-7.5h6V21" /><path d="M2.5 21h19" /></svg>
);

export const InfoIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M12 11.5V16" /></svg>
);

export const MapIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><path d="M9 4L3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4z" /><path d="M9 4v14M15 6v14" /></svg>
);

export const CloudIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg {...base} className={className}><path d="M7 18.5a4.5 4.5 0 1 1 .8-8.9 6 6 0 0 1 11.6 1.9 3.8 3.8 0 0 1-1.1 7H7z" /></svg>
);
