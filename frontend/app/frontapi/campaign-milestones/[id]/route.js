import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PATCH(req, { params }) {
    try {
        const jsonData = await req.json();
        const id = params.id;
        const token = cookies().get('auth_token')?.value;

        if (!id) {
            return NextResponse.json({ msg: 'Milestone ID is required' }, { status: 400 });
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/campaign-milestones/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(jsonData),
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ msg: data.msg || 'Failed to update milestone' }, { status: res.status });
        }

        return NextResponse.json({ msg: data.msg || 'Milestone updated successfully', data: data.data });
    } catch (err) {
        console.error("Server Error:", err);
        return NextResponse.json({ msg: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const id = params.id;
        const token = cookies().get('auth_token')?.value;

        if (!id) {
            return NextResponse.json({ msg: 'Milestone ID is required' }, { status: 400 });
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/campaign-milestones/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ msg: data.msg || 'Failed to delete milestone' }, { status: res.status });
        }

        return NextResponse.json({ msg: data.msg || 'Milestone deleted successfully' });
    } catch (err) {
        console.error("Server Error:", err);
        return NextResponse.json({ msg: 'Internal server error' }, { status: 500 });
    }
}
