import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const token = cookies().get('auth_token')?.value;
    const backendUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/volunteer-teams`;

    const res = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await res.json();

    if (!res.ok) {
      // Backend usually returns {msg: '...'} or simple array/object
      return NextResponse.json(
        { message: data?.message || data?.msg || 'Failed to fetch volunteer teams' },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Server Error (GET /frontapi/volunteer-teams):', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // Parse JSON instead of FormData
    const jsonData = await req.json();
    console.log("FrontAPI received:", jsonData);
    const token = cookies().get('auth_token')?.value;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/volunteer-teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(jsonData),
    });

    const data = await res.json();
    console.log("Backend response:", res.status, data);

    if (!res.ok) {
      return NextResponse.json({ message: data.msg || 'Failed to add ' }, { status: res.status });
    }

    return NextResponse.json({ message: data.msg || 'Added successfully!' });
  } catch (err) {
    console.error("Server Error:", err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const jsonData = await req.json();
    const id = jsonData.id; // Expecting id in the body or we can parse from URL if needed. But usually body is fine.
    // Wait, typically PUT/PATCH has ID in URL or body. Let's assume body for now or query string.
    // The previous code had `const regionId = jsonData.id`.

    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 });
    }

    const token = cookies().get('auth_token')?.value;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/volunteer-teams/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(jsonData),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ message: data.msg || 'Failed to update team' }, { status: res.status });
    }

    return NextResponse.json({ message: data.msg || 'Team updated successfully' });
  } catch (err) {
    console.error("Server Error:", err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "Location ID is required" }, { status: 400 });
  }

  try {
    const token = cookies().get('auth_token')?.value;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/volunteer-teams/${id}/delete`, {
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