import { Client } from '@upstash/qstash';

const qstashToken = process.env.QSTASH_TOKEN;
const qstash = qstashToken ? new Client({ token: qstashToken }) : null;

export async function enqueueTurno(baseUrl: string, data: Record<string, unknown>) {
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
