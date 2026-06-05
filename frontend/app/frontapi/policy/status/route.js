import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PATCH(req) {
  try {
    // Parse JSON instead of FormData
    const jsonData = await req.json();
    const { taskId, status } = jsonData;
    const token = cookies().get('auth_token')?.value;

    if (!taskId) {
      return NextResponse.json({ message: 'Task ID is required' }, { status: 400 });
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(jsonData),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ message: data.msg || 'Failed to update task' }, { status: res.status });
    }

    return NextResponse.json({ message: data.msg || 'Task updated successfully' });
  } catch (err) {
    console.error("Server Error:", err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}