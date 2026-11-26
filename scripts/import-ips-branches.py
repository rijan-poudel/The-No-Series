"""Regenerate the January 2026 directory from pdftotext -layout output."""
import json
import re
import sys
from pathlib import Path

# Codes belong to NCHL-IPS. Bank IDs belong to the public directory.
bank_ids = dict(pair.split(":") for pair in """
0101:nepal 0201:rastriya-banijya 0301:adbl 0401:nabil 0501:nimb
0601:standard-chartered 0701:himalayan 0801:nepal-sbi 1001:everest
1501:machhapuchchhre 1601:kumari 1801:siddhartha 1901:global-ime
2001:citizens 2101:prime 2201:laxmi-sunrise 2301:nic-asia 2501:nmb
2601:prabhu 4501:sanima 5401:lumbini 5901:saptakoshi 6001:jyoti
6401:sindhu 6601:garima 6801:kamana-sewa 7201:muktinath 7301:sangrila
7502:excel 7509:miteri 7517:green-development 7605:narayani 7608:salapa
8101:shine-resunga 9908:corporate-development 9931:mahalaxmi
""".split())

def extract(text):
    if "Date: 2026-01-12" not in text or "NCHL-IPS Members and Branch List" not in text:
        raise ValueError("Expected the 12 January 2026 NCHL-IPS edition")
    records = {}
    for line in text.splitlines():
        if not line.strip() or any(label in line for label in ("Nepal Clearing House Limited (NCHL)", "NCHL-IPS Members and Branch List", "Date: 2026-01-12", "Bank Code Short Code")):
            continue
        match = re.fullmatch(r"\s*(\d{4})\s+\S+\s+(.+?)\s+(\d+)\s+(.+?)\s*", line)
        if not match:
            raise ValueError(f"Unexpected row: {line}")
        code, name, branch, label = match.groups()
        if code not in bank_ids:
            continue
        bank = records.setdefault(bank_ids[code], {"code": code, "sourceName": name, "branches": {}})
        if bank["sourceName"] != name or branch in bank["branches"]:
            raise ValueError(f"Ambiguous row: {line}")
        bank["branches"][branch] = label
    if set(records) != set(bank_ids.values()):
        raise ValueError("Missing a mapped institution")
    return records

if __name__ == "__main__":
    records = extract(Path(sys.argv[1]).read_text())
    print(json.dumps(records, ensure_ascii=False, indent=2))
