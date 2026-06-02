const WEBHOOK_TIMEOUT_MS = 20_000;

const WEBHOOK_URLS = {
  crearTurno: process.env.PA_CREAR_TURNO_URL ?? '',
  crearAutogestion: process.env.PA_CREAR_AUTOGESTION_URL ?? '',
  crearFueraHorario: process.env.PA_CREAR_FUERA_HORARIO_URL ?? '',
};

const requiredUrls: Array<keyof typeof WEBHOOK_URLS> = [
  'crearTurno',
  'crearAutogestion',
  'crearFueraHorario',
];

for (const key of requiredUrls) {
  if (!WEBHOOK_URLS[key]) {
    console.warn(`[power-automate] Missing env var for ${key}`);
  }
}

export { WEBHOOK_URLS };

export async function callPowerAutomate(url: string, data?: unknown): Promise<Response> {
  const response = await fetch(url, {
    method: 'POST',
    headers: data ? { 'Content-Type': 'application/json' } : undefined,
    body: data ? JSON.stringify(data) : undefined,
    signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `Power Automate webhook returned ${response.status}: ${body.slice(0, 200)}`
    );
  }

  return response;
}
