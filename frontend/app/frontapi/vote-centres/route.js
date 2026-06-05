import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
export async function GET() {
    try {
        const token = cookies().get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/vote-centres`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            cache: 'no-store'
        });

        if (!res.ok) {
            const error = await res.json();
            return NextResponse.json({ message: error.message || 'Failed to fetch vote centres' }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('API vote-centres error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const token = cookies().get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/vote-centres`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const error = await res.json();
            return NextResponse.json({ message: error.message || 'Failed to create vote centre' }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('API vote-centres create error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
