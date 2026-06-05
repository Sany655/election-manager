import { cookies } from 'next/headers';
import DefaultLayout from '@/app/components/layout/DefaultLayout'
import ViewTable from '@/app/components/tasks/holiday/ViewTable';
import ProtectedRoute from '@/app/components/ProtectedRoute';

async function fetchHolidays(token) {

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/holidays`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    if (!res.ok) {
        const errorBody = await res.text();
        console.error('Error fetching holiday:', res.status, errorBody);
        throw new Error('Failed to fetch holiday data');
    }

    return res.json();
}

async function fetchUsers(token) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users?role=user`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    if (!res.ok) {
        const errorBody = await res.text();
        console.error('Error fetching user:', res.status, errorBody);
        throw new Error('Failed to fetch user data');
    }

    return res.json();
}
const page = async ({ searchParams }) => {
    const page = parseInt(searchParams?.page || '1');
    const token = cookies().get('auth_token')?.value;
    const holiday = await fetchHolidays(token);
    const users = await fetchUsers(token);


    return (
        <DefaultLayout title='All Holidays'>
            <ProtectedRoute permissions={['view-holidays']}>
            <ViewTable data={holiday.data} users={users.data}/>
            </ProtectedRoute>
        </DefaultLayout>
    )
}

export default page