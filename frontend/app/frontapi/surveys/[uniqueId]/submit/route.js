import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000';

export async function POST(request, { params }) {
    const { uniqueId } = params;
    // const token = cookies().get('auth_token')?.value;
    // if (!token) {
    //     return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    // }
    try {
        const body = await request.json();
        const res = await fetch(`${BACKEND_URL}/api/surveys/public/${uniqueId}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        if (!res.ok) {
            return NextResponse.json(data, { status: res.status });
        }
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
