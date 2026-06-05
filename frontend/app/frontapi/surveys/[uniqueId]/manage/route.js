import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8001';

export async function DELETE(request, { params }) {
    const { uniqueId } = params;
    const token = cookies().get('auth_token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
    try {
        const res = await fetch(`${BACKEND_URL}/api/surveys/${uniqueId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) {
            return NextResponse.json({ error: 'Failed to delete' }, { status: res.status });
        }

        return NextResponse.json({ message: 'Deleted' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

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

export async function GET(request, { params }) {
    const { uniqueId } = params;
    const token = cookies().get('auth_token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
    try {
        const res = await fetch(`${BACKEND_URL}/api/surveys/${uniqueId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            cache: 'no-store'
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
