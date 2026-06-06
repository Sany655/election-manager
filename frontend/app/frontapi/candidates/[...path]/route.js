import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8001';

export async function GET(request, { params }) {
  const token = cookies().get('auth_token')?.value;
  const path = params.path.join('/');
  const { searchParams } = new URL(request.url);
  
  try {
    const res = await fetch(`${BASE_URL}/api/candidates/${path}?${searchParams.toString()}`, {
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

export async function PUT(request, { params }) {
  const token = cookies().get('auth_token')?.value;
  const path = params.path.join('/');
  
  try {
    const formData = await request.formData();
    const res = await fetch(`${BASE_URL}/api/candidates/${path}`, {
      method: 'PUT',
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

export async function POST(request, { params }) {
  const token = cookies().get('auth_token')?.value;
  const path = params.path.join('/');
  
  try {
    const formData = await request.formData();
    const res = await fetch(`${BASE_URL}/api/candidates/${path}`, {
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

export async function DELETE(request, { params }) {
  const token = cookies().get('auth_token')?.value;
  const path = params.path.join('/');
  
  try {
    const res = await fetch(`${BASE_URL}/api/candidates/${path}`, {
      method: 'DELETE',
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
