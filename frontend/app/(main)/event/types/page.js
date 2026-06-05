import { cookies } from 'next/headers';
import DefaultLayout from '@/app/components/layout/DefaultLayout'
import ProtectedRoute from '@/app/components/ProtectedRoute';
import ViewTable from '@/app/components/event/types/ViewTable';

async function fetchEventTypes(token) {

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events/types`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    if (!res.ok) {
        const errorBody = await res.text();
        console.error('Error fetching:', res.status, errorBody);
        throw new Error('Failed to fetch data');
    }

    return res.json();
}

const page = async ({ searchParams }) => {
    const token = cookies().get('auth_token')?.value;
    const eventTypes = await fetchEventTypes(token);

    return (
        <DefaultLayout title='Event types'>
            <ProtectedRoute permissions={['view-policies']}>
                <ViewTable data={eventTypes.data} title='Event Type' />
            </ProtectedRoute>
        </DefaultLayout>
    )
}

export default page