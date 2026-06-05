// app/(main)/event-types/page.js
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DefaultLayout from '@/app/components/layout/DefaultLayout';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import ViewTable from '@/app/components/event-types/ViewTable';

async function fetchEventTypes(token) {

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/event-types`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });
    console.log('res: ', res);

    if (!res.ok) {
        const errorBody = await res.text();
        console.error('Error fetching Event Types:', res.status, errorBody);
        throw new Error('Failed to fetch Event Types data');
    }

    return res.json();
}

const page = async ({ searchParams }) => {
    const token = cookies().get('auth_token')?.value;
    if (!token) {
        redirect('/auth/login');
    }

    const page = parseInt(searchParams?.page || '1');
    const eventtype = await fetchEventTypes(token);

    return (
        <DefaultLayout title='All Event'>
            <ProtectedRoute permissions={['view-event-types']}>
                <ViewTable data={eventtype.data} title='Event' />
            </ProtectedRoute>
        </DefaultLayout>
    )
}

export default page;