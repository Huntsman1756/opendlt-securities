// Shared client-side search/filter logic for the securities index.
// Pure functions — also imported by tests + the G1 search goldens.

// Exact/prefix identifier match dominates; text tokens are discovery.
export function matchRecord(rec, query) {
  const needle = String(query || "").trim().toLowerCase();
  if (!needle) return true;
  for (const id of rec.identifiers || [])
    if (String(id).toLowerCase() === needle) return true;   // exact id
  for (const id of rec.identifiers || [])
    if (String(id).toLowerCase().includes(needle)) return true;
  return needle.split(/\s+/).every(w =>
    (rec.tokens || []).some(t => t.startsWith(w)) ||
    String(rec.issuer || "").toLowerCase().includes(w) ||
    String(rec.name || "").toLowerCase().includes(w));
}

export function scoreRecord(rec, query) {
  const needle = String(query || "").trim().toLowerCase();
  if (!needle) return 0;
  for (const id of rec.identifiers || [])
    if (String(id).toLowerCase() === needle) return 100;
  if (String(rec.isin || "").toLowerCase() === needle) return 100;
  for (const id of rec.identifiers || [])
    if (String(id).toLowerCase().startsWith(needle)) return 80;
  if (String(rec.name || "").toLowerCase().includes(needle)) return 50;
  return 10;
}

export function filterRows(rows, indexBySlug, form) {
  const q = form.q || "";
  return rows.filter(r => {
    const rec = indexBySlug[r.slug];
    if (!matchRecord(rec, q)) return false;
    if (form.j && r.j !== form.j) return false;
    if (form.m && r.m !== form.m) return false;
    if (form.s && r.s !== form.s) return false;
    if (form.n && (form.n === "__none"
        ? r.n !== "" : !r.n.split("|").includes(form.n))) return false;
    if (form.a && r.a !== form.a) return false;
    if (form.t && (form.t === "__none"
        ? r.t !== "" : !r.t.split("|").includes(form.t))) return false;
    return true;
  });
}
