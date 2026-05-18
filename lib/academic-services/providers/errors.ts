export class ProviderNotImplementedError extends Error {
  constructor(provider: string) {
    super(
      `Academic services provider "${provider}" is not implemented yet. See docs/superpowers/plans/2026-05-16-portal-servicios-academicos-utpl.md`,
    );
    this.name = 'ProviderNotImplementedError';
  }
}
