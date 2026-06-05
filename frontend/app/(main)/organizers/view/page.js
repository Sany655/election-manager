// app/(main)/organizers/page.js
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import DefaultLayout from '@/app/components/layout/DefaultLayout';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import ViewTable from '@/app/components/organizers/ViewTable';

async function fetchOrganizers(token) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/organizers`,
    {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  console.log('res: ', res);

  if (!res.ok) {
    const errorBody = await res.text();
    console.error('Error fetching Organizers:', res.status, errorBody);
    throw new Error('Failed to fetch Organizer data');
  }

  return res.json();
}

const page = async ({ searchParams }) => {
  const token = cookies().get('auth_token')?.value;
  if (!token) {
    redirect('/auth/login');
  }

  const page = parseInt(searchParams?.page || '1');
  const organizers = await fetchOrganizers(token);

  return (
    <DefaultLayout title="All Organizers">
      <ProtectedRoute permissions={['view-organizers']}>
        <ViewTable data={organizers.data} title="Organizer" />
      </ProtectedRoute>
    </DefaultLayout>
  );
};

export default page;