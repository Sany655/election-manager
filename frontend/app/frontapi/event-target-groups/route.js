import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Parse JSON instead of FormData
    const jsonData = await req.json();

    console.log('jsondata: ', jsonData);
    
    const token = cookies().get('auth_token')?.value;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events/target-groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(jsonData),
    });
    console.log("response: ", res);

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ message: data.msg || 'Failed to add' }, { status: res.status });
    }

    return NextResponse.json({ message: data.msg || 'Added successfully' });
  } catch (err) {
    console.error("Server Error:", err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    // Parse JSON instead of FormData
    const jsonData = await req.json();
    const taskId = jsonData.id;
    const token = cookies().get('auth_token')?.value;

    if (!taskId) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 });
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events/target-groups/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(jsonData),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ message: data.msg || 'Failed to update' }, { status: res.status });
    }

    return NextResponse.json({ message: data.msg || 'Updated successfully' });
  } catch (err) {
    console.error("Server Error:", err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    try {
        const token = cookies().get('auth_token')?.value;

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events/target-groups/${id}/delete`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ msg: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const search = url.search;
    const token = cookies().get('auth_token')?.value;
    const backendUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/events/target-groups${search}`;

    const res = await fetch(backendUrl, {
      method: 'GET',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });

    let data;
    try { data = await res.json(); } catch { data = { message: await res.text() }; }

    if (!res.ok) {
      return NextResponse.json({ message: data?.message || 'Failed to fetch' }, { status: res.status });
    }
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Server Error (GET /api/event-target-groups):', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
