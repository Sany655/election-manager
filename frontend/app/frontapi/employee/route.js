import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const token = cookies().get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/register-employee`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ msg: data.msg || 'Failed to register' }, { status: res.status });
    }

    return NextResponse.json({ msg: data.msg || 'User registered successfully' });
  } catch (err) {
    console.error("Server Error:", err);
    return NextResponse.json({ msg: err.msg || 'Internal server error' }, { status: err.status });
  }
}

export async function PATCH(req) {
  try {
    const formData = await req.formData();
    const employeeId = formData.get("id");
    const token = cookies().get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/employee/${employeeId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ msg: data.msg || 'Upload failed' }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ msg: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ msg: "User ID is required" }, { status: 400 });
  }

  try {
    const token = cookies().get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 });
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${id}/delete`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ msg: "Internal server error" }, { status: 500 });
  }
}
