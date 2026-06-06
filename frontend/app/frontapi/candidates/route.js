import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8001';

export async function GET(request) {
  const token = cookies().get('auth_token')?.value;
  const { searchParams } = new URL(request.url);
  
  try {
    const res = await fetch(`${BASE_URL}/api/candidates?${searchParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (error) {
    return Response.json({ msg: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  const token = cookies().get('auth_token')?.value;
  
  try {
    const formData = await request.formData();
    const res = await fetch(`${BASE_URL}/api/candidates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (error) {
    return Response.json({ msg: 'Internal Server Error' }, { status: 500 });
  }
}
