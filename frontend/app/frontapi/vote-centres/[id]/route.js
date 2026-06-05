import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
    try {
        const id = params.id;
        const body = await request.json();
        const token = cookies().get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/vote-centres/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const error = await res.json();
            return NextResponse.json({ message: error.message || 'Failed to update vote centre' }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('API vote-centres update error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const id = params.id;
        const token = cookies().get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/vote-centres/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) {
            const error = await res.json();
            return NextResponse.json({ message: error.message || 'Failed to delete vote centre' }, { status: res.status });
        }

        return NextResponse.json({ message: 'Vote centre deleted successfully' });
    } catch (error) {
        console.error('API vote-centres delete error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
