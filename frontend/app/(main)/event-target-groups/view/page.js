// app/(main)/event-types/page.js
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DefaultLayout from '@/app/components/layout/DefaultLayout';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import ViewTable from '@/app/components/event-target-groups/ViewTable';

async function fetchEventTargetGroups(token) {

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events/target-groups`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    if (!res.ok) {
        console.log('response: ', res);

        const errorBody = await res.text();
        console.error('Error fetching Event Target Groups:', res.status, errorBody);
        throw new Error('Failed to fetch Event Target Groups data');
    }

    return res.json();
}

const page = async ({ searchParams }) => {
    console.log('i am in target groups');

    const token = cookies().get('auth_token')?.value;
    if (!token) {
        redirect('/auth/login');
    }

    const page = parseInt(searchParams?.page || '1');
    const eventtargetgroup = await fetchEventTargetGroups(token);

    return (
        <DefaultLayout title='All Event'>
            <ProtectedRoute permissions={['view-target-groups']}>
                <ViewTable data={eventtargetgroup.data} title='Event' />
            </ProtectedRoute>
        </DefaultLayout>
    )
}

export default page;