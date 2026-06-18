import { Client } from '@upstash/qstash';

const qstashToken = process.env.QSTASH_TOKEN;
const qstash = qstashToken ? new Client({ token: qstashToken }) : null;

function isLocalUrl(url: string): boolean {
  return url.includes('localhost') || url.includes('127.0.0.1') || url.includes('::1');
}

export async function enqueueTurno(
  baseUrl: string,
  data: Record<string, unknown>,
  directWebhookUrl?: string
) {
  if (isLocalUrl(baseUrl) && directWebhookUrl) {
    console.log('[turno-queue] Localhost detectado — llamando a Power Automate directamente');
    const response = await fetch(directWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Power Automate returned ${response.status}: ${body.slice(0, 200)}`);
    }
    return;
  }

  if (!qstash) {
    console.warn('[turno-queue] QSTASH_TOKEN no configurado — turno no encolado');
    return;
  }

  const queue = qstash.queue({ queueName: 'turnos' });

  await queue.enqueueJSON({
    url: `${baseUrl}/api/qstash-worker`,
    body: data,
  });
}
