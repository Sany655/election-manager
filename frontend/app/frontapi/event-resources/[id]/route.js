import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function DELETE(req, { params }) {
    const { id } = params;
    const token = cookies().get('auth_token')?.value;

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/event-resources/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ message: data.msg || 'Failed to delete' }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (err) {
        console.error("Server Error:", err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
