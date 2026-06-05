import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * CREATE ORGANIZER
 * POST /api/organizers
 */
export async function POST(req) {
  try {
    const jsonData = await req.json();
    const token = cookies().get('auth_token')?.value;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/organizers`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jsonData),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.msg || 'Failed to add organizer' },
        { status: res.status }
      );
    }

    return NextResponse.json({
      message: data.msg || 'Organizer added successfully',
    });
  } catch (err) {
    console.error('Server Error (POST /api/organizers):', err);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * UPDATE ORGANIZER
 * PATCH /api/organizers
 */
export async function PATCH(req) {
  try {
    const jsonData = await req.json();
    const id = jsonData.id;
    const token = cookies().get('auth_token')?.value;
    console.log('token found');
    
    if (!id) {
      return NextResponse.json(
        { message: 'ID is required' },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/organizers/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jsonData),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.msg || 'Failed to update organizer' },
        { status: res.status }
      );
    }

    return NextResponse.json({
      message: data.msg || 'Organizer updated successfully',
    });
  } catch (err) {
    console.error('Server Error (PATCH /api/organizers):', err);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE ORGANIZER
 * DELETE /api/organizers?id=ID
 */
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { message: 'ID is required' },
      { status: 400 }
    );
  }

  try {
    const token = cookies().get('auth_token')?.value;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/organizers/${id}/delete`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Server Error (DELETE /api/organizers):', err);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET ORGANIZERS (list or single)
 * GET /api/organizers
 * GET /api/organizers?id=ID
 */
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const search = url.search; // ?id= or pagination params
    const token = cookies().get('auth_token')?.value;

    const backendUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/organizers${search}`;

    const res = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    console.log('res: ', res);

    let data;
    try {
      data = await res.json();
    } catch {
      data = { message: await res.text() };
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          message:
            data?.message ||
            data?.msg ||
            'Failed to fetch organizers',
        },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Server Error (GET /api/organizers):', err);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}