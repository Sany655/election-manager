import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Parse JSON instead of FormData
    const jsonData = await req.json();
    const token = cookies().get('auth_token')?.value;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(jsonData),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ message: data.msg || 'Failed to add team' }, { status: res.status });
    }

    return NextResponse.json({ message: data.msg || 'Team added successfully' });
  } catch (err) {
    console.error("Server Error:", err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    // Parse JSON instead of FormData
    const jsonData = await req.json();
    const teamId = jsonData.id;
    const token = cookies().get('auth_token')?.value;

    if (!teamId) {
      return NextResponse.json({ message: 'team ID is required' }, { status: 400 });
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/teams/${teamId}`, {
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
        return NextResponse.json({ message: "Team ID is required" }, { status: 400 });
    }

    try {
        const token = cookies().get('auth_token')?.value;

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/teams/${id}/delete`, {
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