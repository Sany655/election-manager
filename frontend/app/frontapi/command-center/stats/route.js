
import { cookies } from "next/headers";

export async function GET(request) {
    const cookieStore = cookies();
    const token = cookieStore.get("auth_token");

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/command-center/stats`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token?.value}`,
        },
        cache: 'no-store'
    });

    const data = await res.json();
    return Response.json(data);
}
