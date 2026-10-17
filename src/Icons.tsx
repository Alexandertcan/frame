export type IconName =
  | "arrow"
  | "plus"
  | "grid"
  | "file"
  | "chevron"
  | "search"
  | "star"
  | "check"
  | "desktop"
  | "tablet"
  | "phone"
  | "undo"
  | "download"
  | "edit"
  | "copy"
  | "trash"
  | "close"
  | "layers"
  | "image"
  | "send"
  | "compare"
  | "menu"
  | "external"
  | "folder";
const paths: Record<IconName, string> = {
  arrow: "M4 12h15m-6-6 6 6-6 6",
  plus: "M12 5v14M5 12h14",
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  file: "M6 3h8l4 4v14H6zM14 3v5h4",
  chevron: "m9 5 7 7-7 7",
  search: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14m5 12 6 6",
  star: "m12 3 2.8 5.8 6.4.9-4.6 4.5 1.1 6.3-5.7-3-5.7 3 1.1-6.3L3 9.7l6.4-.9z",
  check: "m5 12 4 4 10-10",
  desktop: "M3 4h18v13H3zM12 17v4M8 21h8",
  tablet: "M5 3h14v18H5zM11 18h2",
  phone: "M8 2h8v20H8zM11 19h2",
  undo: "M9 5 3 10l6 5M3 10h10a7 7 0 0 1 7 7",
  download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
  edit: "m4 16 12-12 4 4L8 20H4zM14 6l4 4",
  copy: "M8 8h13v13H8zM4 16H3V3h13v1",
  trash: "M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7",
  close: "m6 6 12 12M6 18 18 6",
  layers: "m12 3 10 6-10 6L2 9zM2 14l10 6 10-6",
  image: "M3 3h18v18H3zM3 16l6-6 5 5 3-3 4 4M15 7h.01",
  send: "m3 3 18 9-18 9 4-9zM7 12h14",
  compare: "M4 4h6v16H4zM14 4h6v16h-6z",
  menu: "M4 6h16M4 12h16M4 18h16",
  external: "M13 3h8v8M21 3 10 14M10 3H3v18h18v-7",
  folder: "M3 6V4h7l2 3h9v13H3z",
};
export default function Icon({
  name,
  size = 18,
}: {
  name: IconName;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
