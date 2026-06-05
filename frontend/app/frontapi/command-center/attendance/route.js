
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

export async function POST(request) {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token');

    if (!token) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/command-center/attendance`, body, {
            headers: {
                Authorization: `Bearer ${token.value}`
            }
        });
        return NextResponse.json(response.data);
    } catch (error) {
        return NextResponse.json(
            { message: error.response?.data?.message || 'Server Error' },
            { status: error.response?.status || 500 }
        );
    }
}
