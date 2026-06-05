import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const jsonData = await req.json();
        const token = cookies().get('auth_token')?.value;

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events/assign-team`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(jsonData),
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ message: data.msg || 'Failed to assign team' }, { status: res.status });
        }

        return NextResponse.json({ message: data.msg || 'Team assigned successfully' });
    } catch (err) {
        console.error("Server Error:", err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req) {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const teamId = searchParams.get("teamId");


    if (!eventId || !teamId) {
        return NextResponse.json({ message: "Ids are required" }, { status: 400 });
    }

    try {
        const token = cookies().get('auth_token')?.value;

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events/${eventId}/teams/${teamId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ message: data.msg || 'Failed to remove team' }, { status: res.status });
        }

        return NextResponse.json({ message: data.msg || "Team removed successfully" });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ msg: "Internal server error" }, { status: 500 });
    }
}
