import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/* =========================
   CREATE RESOURCE
   POST /api/resource
========================= */
export async function POST(req) {
  try {
    const jsonData = await req.json();
    const token = cookies().get("auth_token")?.value;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/resources`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jsonData),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.msg || "Failed to add resource" },
        { status: res.status }
      );
    }

    return NextResponse.json({
      message: data.msg || "Resource added successfully",
    });
  } catch (err) {
    console.error("Server Error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================
   UPDATE RESOURCE
   PATCH /api/resource
========================= */
export async function PATCH(req) {
  try {
    const jsonData = await req.json();
    const resourceId = jsonData.id;
    const token = cookies().get("auth_token")?.value;

    if (!resourceId) {
      return NextResponse.json(
        { message: "ID is required" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/resources/${resourceId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jsonData),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.msg || "Failed to update resource" },
        { status: res.status }
      );
    }

    return NextResponse.json({
      message: data.msg || "Resource updated successfully",
    });
  } catch (err) {
    console.error("Server Error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE RESOURCE
   DELETE /api/resource?id=1
========================= */
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { message: "ID is required" },
      { status: 400 }
    );
  }

  try {
    const token = cookies().get("auth_token")?.value;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/resources/${id}/delete`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}