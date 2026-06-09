import { NextResponse } from 'next/server';

let cerradoState = false;

export async function GET() {
  return NextResponse.json({ cerrado: cerradoState });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (typeof body.cerrado !== 'boolean') {
      return NextResponse.json({ error: 'cerrado must be a boolean' }, { status: 400 });
    }
    cerradoState = body.cerrado;
    return NextResponse.json({ cerrado: cerradoState });
  } catch (error) {
    console.error('Error updating cerrado:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
