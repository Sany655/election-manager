import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const jsonData = await req.json();
        const token = cookies().get('auth_token')?.value;

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/messages/team`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(jsonData),
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ message: data.msg || 'Failed to send message' }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (err) {
        console.error("Server Error:", err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
