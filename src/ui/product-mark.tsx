// Filled silhouettes cut from the shapes of everyday banking documents.
const cuts = {
  passbook:
    "M4 10 9 5h22v24H10a6 6 0 0 1-6-6Zm6-2-3 3h20V8Zm2 8v2h11v-2Zm0 5v2h8v-2Z",
  certificate:
    "M3 6h28v15h-4v9l-4-3-4 3v-9H3Zm5 5v2h9v-2Zm0 5v2h6v-2Zm15-5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
  card: "m3 12 25-6 1 4-26 6Zm1 4h27v14H4Zm4 4v5h6v-5Zm12 5v2h7v-2Z",
  receipt:
    "M5 3h19v8h-3V7H8v18h6v4H5Zm11 10h15v17l-3-2-3 2-3-2-3 2-3-2Zm3 4v2h9v-2Zm0 5v2h6v-2Z",
};

export function ProductMark({ kind }: { kind: keyof typeof cuts }) {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
      <path d={cuts[kind]} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}
