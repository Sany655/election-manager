import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
    const { id } = params;
    const token = cookies().get('auth_token')?.value;

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/event-resources/event/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(data, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (err) {
        console.error("Server Error:", err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    const { id } = params;
    const token = cookies().get('auth_token')?.value;

    try {
        const body = await req.json();

        // Inject event_id from params into body
        const payload = { ...body, event_id: id };

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/event-resources`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ message: data.msg || 'Failed to add' }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (err) {
        console.error("Server Error:", err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
