import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
    try {
        const queryParams = new URLSearchParams();
        const token = cookies().get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const searchParams = request.nextUrl.searchParams;
        if (searchParams.get('division_id')) queryParams.append('division_id', searchParams.get('division_id'));
        if (searchParams.get('district_id')) queryParams.append('district_id', searchParams.get('district_id'));
        if (searchParams.get('upazilla_id')) queryParams.append('upazilla_id', searchParams.get('upazilla_id'));
        if (searchParams.get('union_id')) queryParams.append('union_id', searchParams.get('union_id'));
        if (searchParams.get('search')) queryParams.append('search', searchParams.get('search'));
        if (searchParams.get('page')) queryParams.append('page', searchParams.get('page'));
        if (searchParams.get('limit')) queryParams.append('limit', searchParams.get('limit'));

        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/voters${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch voters');
        }
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching voters:', error);
        throw error;
    }
}

export async function POST(request) {
    const body = await request.json();
    const token = cookies().get('auth_token')?.value;
    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/voters`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Backend error response:', errorData);
            throw new Error(errorData.message || errorData.msg || JSON.stringify(errorData.errors) || 'Failed to create voter');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating voter:', error);
        throw error;
    }
}
