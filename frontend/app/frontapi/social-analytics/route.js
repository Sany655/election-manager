import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        console.log('Received analysis request:', body);
        const token = cookies().get('auth_token')?.value;
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/social-analytics/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error analyzing post:', error);
        return NextResponse.json({ error: 'Failed to analyze post' }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        const backendUrl = id
            ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/social-analytics/${id}`
            : `${process.env.NEXT_PUBLIC_BASE_URL}/api/social-analytics/`;
        const token = cookies().get('auth_token')?.value;
        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error fetching history:', error);
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }
        const token = cookies().get('auth_token')?.value;
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/social-analytics/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error deleting analysis:', error);
        return NextResponse.json({ error: 'Failed to delete analysis' }, { status: 500 });
    }
}