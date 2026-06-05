
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

export async function GET(request) {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token');

    if (!token) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const union_id = searchParams.get('union_id');

    let query = '';
    if (union_id) query = `?union_id=${union_id}`;

    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/command-center/map${query}`, {
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
