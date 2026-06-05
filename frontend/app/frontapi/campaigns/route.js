import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        const token = cookies().get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/campaigns`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();
        console.log('data: ', data);

        if (!res.ok) {
            return NextResponse.json({ msg: data.msg || 'Failed to fetch campaigns' }, { status: res.status });
        }

        return NextResponse.json({ success: true, data: data.data });
    } catch (err) {
        console.error("Server Error:", err);
        return NextResponse.json({ msg: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const jsonData = await req.json();
        const token = cookies().get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/campaigns`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(jsonData),
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ msg: data.msg || 'Failed to add campaign' }, { status: res.status });
        }

        return NextResponse.json({ msg: data.msg || 'Campaign added successfully', data: data.data });
    } catch (err) {
        console.error("Server Error:", err);
        return NextResponse.json({ msg: 'Internal server error' }, { status: 500 });
    }
}
