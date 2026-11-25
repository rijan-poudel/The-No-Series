"use client";

export function MobileBankLink({ id, name }: { id: string; name: string }) {
  const target = `mobile-fees-${id}`;

  return (
    <a
      className="mobile-bank-link"
      href={`#${target}`}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
          return;
        const details = document.getElementById(target)?.closest("details");
        if (details) details.open = true;
      }}
    >
      {name}
    </a>
  );
}
