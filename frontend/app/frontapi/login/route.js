// app/api/login/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Helper to parse durations like '3d', '1h' into seconds
const parseDurationInSeconds = (duration) => {
    if (!duration) return 60 * 60 * 24 * 3; // Default 3 days
    if (typeof duration === 'number') return duration;
    if (!isNaN(duration)) return parseInt(duration);

    const match = duration.match(/^(\d+)([dhms])$/);
    if (!match) return 60 * 60 * 24 * 3;

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
        case 'd': return value * 24 * 60 * 60;
        case 'h': return value * 60 * 60;
        case 'm': return value * 60;
        case 's': return value;
        default: return value;
    }
};

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/login`, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            headers: { 'Content-Type': 'application/json' },
        });

        console.log(res);

        if (!res.ok) {
            const error = await res.json();
            return NextResponse.json({ message: error.message || 'Invalid credentials' }, { status: 401 });
        }
        else {
            const data = await res.json();
            const token = data.token;
            if (!token) {
                return NextResponse.json({ message: 'No token returned' }, { status: 500 });
            }

            // Parse the env var to seconds
            const maxAge = parseDurationInSeconds(process.env.NEXT_JWT_EXPIRED_IN);

            cookies().set({
                name: 'auth_token',
                value: token,
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
                path: '/',
                maxAge: maxAge,
            });
            return NextResponse.json(data);
        }

    } catch (error) {
        console.error('API login error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
