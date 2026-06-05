import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import DefaultLayout from "@/app/components/layout/DefaultLayout";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import ResourceOverview from "@/app/components/resource/Overview";

/* ================================
   Fetch Resources
================================ */
async function fetchResources(token) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/resources`,
    {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("Error fetching resources:", res.status, errorBody);
    throw new Error("Failed to fetch resources");
  }

  return res.json();
}

/* ================================
   Page Component
================================ */
const page = async ({ searchParams }) => {
  const token = cookies().get("auth_token")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  const pageNo = parseInt(searchParams?.page || "1");

  const resources = await fetchResources(token);

  return (
    <DefaultLayout title="Resource Management">
      <ProtectedRoute permissions={['view-resources']}>
        <ResourceOverview
          resources={resources.data || []}
          page={pageNo}
        />
      </ProtectedRoute>
    </DefaultLayout>
  );
};

export default page;