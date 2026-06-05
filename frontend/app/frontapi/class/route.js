import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
      const formData = await req.json(); 
      const token = cookies().get('auth_token')?.value;
  
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        return NextResponse.json({ message: data.msg  }, { status: res.status });
      }
  
      return NextResponse.json(data);
    } catch (err) {
      console.error(err);
      return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }

export async function PATCH(req) {
    try {
      const formData = await req.json(); 
      const clsId = formData.id;
      const token = cookies().get('auth_token')?.value;
  
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/classes/${clsId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        return NextResponse.json({ message: data.msg }, { status: res.status });
      }
  
      return NextResponse.json(data);
    } catch (err) {
      console.error(err);
      return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }

  export async function DELETE(req) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
  
    if (!id) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }
  
    try {
      const token = cookies().get('auth_token')?.value;

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/classes/${id}/delete`, {
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
  