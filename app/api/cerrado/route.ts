import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const CERRADO_PATH = join(process.cwd(), 'data', 'cerrado.json');

async function readCerrado(): Promise<{ cerrado: boolean }> {
  try {
    const raw = await readFile(CERRADO_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { cerrado: false };
  }
}

async function writeCerrado(cerrado: boolean): Promise<void> {
  await writeFile(CERRADO_PATH, JSON.stringify({ cerrado }, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const data = await readCerrado();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading cerrado:', error);
    return NextResponse.json({ cerrado: false });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (typeof body.cerrado !== 'boolean') {
      return NextResponse.json({ error: 'cerrado must be a boolean' }, { status: 400 });
    }
    await writeCerrado(body.cerrado);
    return NextResponse.json({ cerrado: body.cerrado });
  } catch (error) {
    console.error('Error updating cerrado:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
