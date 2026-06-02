import { NextResponse } from 'next/server';
import { execFile } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { promisify } from 'node:util';

type UnknownRecord = Record<string, unknown>;
type StoredEvent = {
  id: number;
  listName: string;
  receivedAt: string;
  payload: string;
};

const execFileAsync = promisify(execFile);
const DB_PATH = resolve(process.cwd(), 'data/microsoft-lists-test.sqlite');

function escapeSql(value: string): string {
  return value.replaceAll("'", "''");
}

async function ensureDb(): Promise<void> {
  await mkdir(resolve(process.cwd(), 'data'), { recursive: true });
  await execFileAsync('sqlite3', [
    DB_PATH,
    `CREATE TABLE IF NOT EXISTS webhook_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      list_name TEXT NOT NULL,
      received_at TEXT NOT NULL,
      payload_json TEXT NOT NULL
    );`,
  ]);
}

async function insertEvent(event: { listName: string; receivedAt: string; payload: string }): Promise<void> {
  await ensureDb();
  const sql = `INSERT INTO webhook_events (list_name, received_at, payload_json)
  VALUES ('${escapeSql(event.listName)}', '${escapeSql(event.receivedAt)}', '${escapeSql(event.payload)}');`;
  await execFileAsync('sqlite3', [DB_PATH, sql]);
}

async function queryEvents(listNameFilter: string | null, limit: number): Promise<StoredEvent[]> {
  await ensureDb();
  const whereClause = listNameFilter
    ? `WHERE list_name = '${escapeSql(listNameFilter)}'`
    : '';
  const sql = `
    SELECT id, list_name as listName, received_at as receivedAt, payload_json as payload
    FROM webhook_events
    ${whereClause}
    ORDER BY id DESC
    LIMIT ${limit};
  `;

  const { stdout } = await execFileAsync('sqlite3', ['-json', DB_PATH, sql]);
  if (!stdout.trim()) return [];
  return JSON.parse(stdout) as StoredEvent[];
}

async function countEvents(listNameFilter: string | null): Promise<number> {
  await ensureDb();
  const whereClause = listNameFilter
    ? `WHERE list_name = '${escapeSql(listNameFilter)}'`
    : '';
  const sql = `SELECT COUNT(*) as total FROM webhook_events ${whereClause};`;
  const { stdout } = await execFileAsync('sqlite3', ['-json', DB_PATH, sql]);
  const parsed = JSON.parse(stdout) as Array<{ total: number }>;
  return parsed[0]?.total ?? 0;
}

function parseBody(value: unknown): UnknownRecord {
  if (value && typeof value === 'object') {
    return value as UnknownRecord;
  }

  return {};
}

function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function normalizePayload(payload: UnknownRecord): UnknownRecord {
  const normalized = { ...payload };
  const items = normalized.items;

  if (typeof items === 'string') {
    const trimmed = items.trim();
    if (
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('{') && trimmed.endsWith('}'))
    ) {
      normalized.items = tryParseJson(trimmed);
    }
  }

  return normalized;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const listNameFilter = searchParams.get('listName');
  const limitParam = Number.parseInt(searchParams.get('limit') ?? '20', 10);
  const limit = Number.isNaN(limitParam) ? 20 : Math.max(1, Math.min(limitParam, 100));
  const events = await queryEvents(listNameFilter, limit);
  const parsedEvents = events.map((event) => ({
    id: event.id,
    listName: event.listName,
    receivedAt: event.receivedAt,
    payload: JSON.parse(event.payload) as UnknownRecord,
  }));
  const totalEvents = await countEvents(listNameFilter);

  return NextResponse.json({
    ok: true,
    endpoint: 'microsoft-lists-webhook',
    storage: 'sqlite',
    dbPath: DB_PATH,
    timestamp: new Date().toISOString(),
    totalEvents,
    returned: parsedEvents.length,
    listNameFilter: listNameFilter ?? null,
    events: parsedEvents,
  });
}

export async function POST(request: Request) {
  try {
    const expectedSecret = process.env.MICROSOFT_LISTS_WEBHOOK_SECRET;
    const receivedSecret = request.headers.get('x-webhook-secret');

    if (expectedSecret && receivedSecret !== expectedSecret) {
      return NextResponse.json({ ok: false, error: 'Unauthorized webhook secret' }, { status: 401 });
    }

    const raw = await request.json();
    const body = normalizePayload(parseBody(raw));
    const receivedAt = new Date().toISOString();
    const listName = String(body.ListName ?? 'unknown');
    await insertEvent({
      listName,
      receivedAt,
      payload: JSON.stringify(body),
    });

    // Keep response minimal and stable for Power Automate.
    return NextResponse.json({
      ok: true,
      receivedAt,
      storage: 'sqlite',
      keys: Object.keys(body),
      itemCount: Array.isArray(body.items) ? body.items.length : null,
      sample: {
        id: body.ID ?? body.Id ?? null,
        title: body.Title ?? body.title ?? null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
