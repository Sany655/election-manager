
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const formData = await req.formData();
        const token = cookies().get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/command-center/upload`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ success: false, message: data.message || 'Upload failed' }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (err) {
        console.error("Upload Proxy Error:", err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
