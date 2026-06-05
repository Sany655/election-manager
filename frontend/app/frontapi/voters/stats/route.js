import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const token = cookies().get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/voters/stats`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch voter statistics');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching voter statistics:', error);
        throw error;
    }
}