
import { cookies } from "next/headers";

export async function GET(request) {
    const cookieStore = cookies();
    const token = cookieStore.get("auth_token");

    // Check what token name is used elsewhere. Map route used 'token'.
    // Request URL for query params
    const { searchParams } = new URL(request.url);
    const union_id = searchParams.get('union_id');
    const query = union_id ? `?union_id=${union_id}` : '';

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/vote-centres${query}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token?.value}`,
            },
            cache: 'no-store'
        });

        if (!res.ok) {
            throw new Error(`Backend responded with status: ${res.status}`);
        }

        const data = await res.json();

        // Backend returns array directly: [ {}, {} ]
        // Frontend expects: { success: true, data: [ ... ] }

        return Response.json({ success: true, data: data });
    } catch (error) {
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
}
