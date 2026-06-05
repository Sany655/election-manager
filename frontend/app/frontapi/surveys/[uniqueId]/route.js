import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000';

export const dynamic = 'force-dynamic';

// Public GET
export async function GET(request, { params }) {
    const { uniqueId } = params;
    try {
        const res = await fetch(`${BACKEND_URL}/api/surveys/public/${uniqueId}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Protected PUT (Update)
export async function PUT(request, { params }) {
    const { uniqueId } = params;
    const body = await request.json();
    const token = cookies().get('auth_token')?.value;

    if (!token) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        const res = await fetch(`${BACKEND_URL}/api/surveys/${uniqueId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        if (!res.ok) {
            return NextResponse.json(data, { status: res.status });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Protected DELETE
export async function DELETE(request, { params }) {
    const { uniqueId } = params;
    const token = cookies().get('auth_token')?.value;

    if (!token) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        // Forward query params (like force=true) if needed
        const url = new URL(request.url);
        const force = url.searchParams.get('force');
        const query = force ? `?force=${force}` : '';

        const res = await fetch(`${BACKEND_URL}/api/surveys/${uniqueId}${query}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            return NextResponse.json(data || { error: 'Failed to delete' }, { status: res.status });
        }

        return NextResponse.json({ message: 'Deleted' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
