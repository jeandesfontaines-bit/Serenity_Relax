/* ─────────────────────────────────────────
   Dashboard Design Tokens — Serenity Relax
   Calm premium, modern clarity, soft therapeutic warmth.
   ───────────────────────────────────────── */

/* ── Layout shells ── */
export const dashboardShell =
  "bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.08),_transparent_28%),linear-gradient(180deg,#fafbfc_0%,#f5f7fb_100%)] text-[#1f2937] font-sans";

export const dashboardPageContainer =
  "mx-auto w-full max-w-[1140px] px-6 py-8 lg:px-8 lg:py-10";

/* ── Panels ── */
export const dashboardPanel =
  "dashboard-panel";

export const dashboardPanelSoft =
  "dashboard-panel-soft";

export const dashboardInset =
  "dashboard-inset";

/* ── Toolbar inputs & buttons ── */
export const dashboardToolbarInput =
  "dashboard-toolbar-input";

export const dashboardToolbarButton =
  "dashboard-toolbar-button";

export const dashboardIconButton =
  "dashboard-icon-button";

/* ── Table elements ── */
export const dashboardTableHeader =
  "bg-[#f8fafc] text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748b] border-b border-[#e2e8f0]";

export const dashboardTableSectionHeader =
  "flex flex-col gap-3 border-b border-[#e2e8f0] bg-[#fbfcff] px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8";

export const dashboardTableCell =
  "px-4 py-4 lg:px-6";

/* ── Section structure ── */
export const dashboardSectionHeader =
  "flex items-center justify-between gap-4";

/* ── Typography — ZERO serif ── */
export const dashboardTitle =
  "dashboard-title";

export const dashboardTitleLg =
  "dashboard-title-lg";

export const dashboardEyebrow =
  "dashboard-eyebrow";

export const dashboardMutedText =
  "dashboard-muted-text";

/* ── Buttons ── */
export const dashboardPrimaryButton =
  "dashboard-primary-button";

export const dashboardSecondaryButton =
  "dashboard-secondary-button";

/* ── Chips / badges ── */
export const dashboardChip =
  "dashboard-chip";

/* ── Status badges — richly differentiated ── */
export const statusBadge = {
  confirmed:  "bg-[#eef2ff] text-[#4338ca] border border-[#c7d2fe]",
  scheduled:  "bg-[#ede9fe] text-[#6d28d9] border border-[#ddd6fe]",
  pending:    "bg-[#fef3c7] text-[#b45309] border border-[#fcd34d]",
  cancelled:  "bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca]",
  late:       "bg-[#ffedd5] text-[#c2410c] border border-[#fdba74]",
  paid:       "bg-[#dcfce7] text-[#15803d] border border-[#86efac]",
} as const;
