import { cookies } from 'next/headers';
import DefaultLayout from '@/app/components/layout/DefaultLayout'
import ProtectedRoute from '@/app/components/ProtectedRoute';
import ViewTable from '@/app/components/communication/sms/ViewTable';

async function fetchUsers(token) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users?role=volunteer`, {
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
    const token = cookies().get('auth_token')?.value;
    const users = await fetchUsers(token);
    return (
        <DefaultLayout title='SMS Configuration'>
            <ProtectedRoute permissions={['view-sms']}>
                <ViewTable token={token} users={users.data} title='Sms' />
            </ProtectedRoute>
        </DefaultLayout>
    )
}

export default page