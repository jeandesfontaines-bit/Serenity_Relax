/* ─────────────────────────────────────────
   Dashboard Design Tokens — Serenity Relax
   Aligned to the shared dashboard palette in globals.css.
   ───────────────────────────────────────── */

/* ── Layout shells ── */
export const dashboardShell =
  "bg-[radial-gradient(circle_at_top,_rgba(183,209,220,0.24),_transparent_30%),linear-gradient(180deg,#f7f4ec_0%,#f1ece2_100%)] text-[var(--dashboard-asphalt)] font-sans";

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
  "bg-[var(--dashboard-light)] text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-rooftop-grey)] border-b border-[var(--dashboard-border)]";

export const dashboardTableSectionHeader =
  "flex flex-col gap-3 border-b border-[var(--dashboard-border)] bg-[color:rgba(255,255,255,0.86)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8";

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

/* ── Status badges ── */
export const statusBadge = {
  confirmed: "border border-[#bad5c8] bg-[#e8f2ee] text-[var(--dashboard-bench-green)]",
  scheduled: "border border-[#bdd0e5] bg-[#e9f0f8] text-[var(--dashboard-real-blue)]",
  pending: "border border-[#f0cfb8] bg-[#f8ebdf] text-[#9d5f32]",
  cancelled: "border border-[#f2bec2] bg-[#fdeced] text-[var(--dashboard-deep-red)]",
  late: "border border-[#f0c5a7] bg-[#fdf0e6] text-[#ab612f]",
  paid: "border border-[#bfe2c9] bg-[#ebf7ef] text-[var(--dashboard-fresh-green)]",
} as const;
