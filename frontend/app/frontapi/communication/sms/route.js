import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Parse JSON instead of FormData
    const jsonData = await req.json();
    const token = cookies().get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/messages/sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(jsonData),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ message: data.msg || 'Failed to add region' }, { status: res.status });
    }

    return NextResponse.json({ message: data.msg || 'Region added successfully' });
  } catch (err) {
    console.error("Server Error:", err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

