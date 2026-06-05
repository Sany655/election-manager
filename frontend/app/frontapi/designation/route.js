import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8001';

async function forwardJson(req, backendUrl, method = 'POST') {
  const token = cookies().get('auth_token')?.value;
  const body = await req.json().catch(() => ({}));

  const res = await fetch(backendUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  // try to parse JSON response, fallback to text
  let data;
  try {
    data = await res.json();
  } catch {
    data = { message: await res.text() };
  }

  return { res, data };
}

export async function POST(req) {
  try {
    const backendUrl = `${BACKEND}/api/designations`;
    const { res, data } = await forwardJson(req, backendUrl, 'POST');

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || data?.msg || 'Failed to add designations' },
        { status: res.status }
      );
    }

    return NextResponse.json(
      { message: data?.message || data?.msg || 'Designations added successfully', data: data?.data ?? data },
      { status: res.status }
    );
  } catch (err) {
    console.error('Server Error (POST /api/designations):', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const jsonBody = await req.json().catch(() => ({}));
    const id = jsonBody.id || jsonBody._id;
    if (!id) {
      return NextResponse.json({ message: 'Designation ID is required' }, { status: 400 });
    }

    const backendUrl = `${BACKEND}/api/designations/${encodeURIComponent(id)}`;
    const { res, data } = await forwardJson(req, backendUrl, 'PATCH');

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || data?.msg || 'Failed to update designations' },
        { status: res.status }
      );
    }

    return NextResponse.json(
      { message: data?.message || data?.msg || 'Designations updated successfully', data: data?.data ?? data },
      { status: res.status }
    );
  } catch (err) {
    console.error('Server Error (PATCH /api/designations):', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Designation ID is required' }, { status: 400 });
    }

    const token = cookies().get('auth_token')?.value;
    const backendUrl = `${BACKEND}/api/designations/${encodeURIComponent(id)}/delete`;

    const res = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = { message: await res.text() };
    }

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || data?.msg || 'Failed to delete designations' },
        { status: res.status }
      );
    }

    return NextResponse.json({ message: data?.message || data?.msg || 'Designations deleted', data: data?.data ?? data }, { status: res.status });
  } catch (err) {
    console.error('Server Error (DELETE /api/designations):', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}