export const ADMIN_TABS_LIST_CLASS =
  'mb-5 flex !h-auto w-full flex-wrap gap-1 overflow-x-auto rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-[color:var(--svc-color-border-subtle)] bg-[color:var(--svc-color-surface-subtle)] p-1.5 [scrollbar-width:none] group-data-[orientation=horizontal]/tabs:!h-auto sm:grid sm:grid-cols-3 [&::-webkit-scrollbar]:hidden';

/** Pestañas dentro del sheet lateral (menos margen inferior). */
export const ADMIN_SHEET_TABS_LIST_CLASS =
  'mb-4 grid !h-auto w-full grid-cols-2 gap-1 rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-[color:var(--svc-color-border-subtle)] bg-[color:var(--svc-color-surface-subtle)] p-1.5 group-data-[orientation=horizontal]/tabs:!h-auto';

export const ADMIN_TABS_TRIGGER_CLASS =
  'inline-flex !h-auto min-w-max flex-none items-center justify-center rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-transparent bg-transparent px-3 py-2 text-[var(--svc-text-xs)] font-medium tracking-[0.06em] text-[color:var(--svc-color-text-muted)] uppercase transition-colors after:hidden hover:border-[color:var(--svc-color-border-subtle)] hover:bg-[color:var(--svc-color-surface-elevated)] hover:text-[color:var(--svc-color-text-primary)] data-[active]:border-[color:var(--svc-color-border-strong)] data-[active]:bg-[color:var(--svc-color-surface-elevated)] data-[active]:text-[color:var(--svc-color-text-primary)] group-data-[orientation=horizontal]/tabs:!h-auto sm:min-w-0 sm:flex-1';

export const ADMIN_SELECT_CLASS =
  'h-10 w-full rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-[color:var(--svc-color-border-subtle)] bg-[color:var(--svc-color-surface-subtle)] px-3 text-[var(--svc-text-sm)] text-[color:var(--svc-color-text-primary)] outline-none transition focus-visible:border-[color:var(--svc-color-border-strong)] focus-visible:ring-0';

export const ADMIN_FIELD_CLASS =
  'rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-[color:var(--svc-color-border-subtle)] bg-[color:var(--svc-color-surface-subtle)] text-[color:var(--svc-color-text-primary)] shadow-none focus-visible:border-[color:var(--svc-color-border-strong)] focus-visible:ring-0';
