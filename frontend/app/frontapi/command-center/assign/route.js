
import { cookies } from "next/headers";

export async function POST(request) {
    const cookieStore = cookies();
    const token = cookieStore.get("auth_token");
    const body = await request.json();

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/command-center/assign`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token?.value}`,
        },
        body: JSON.stringify(body),
    });

    const data = await res.json();
    return Response.json(data);
}
