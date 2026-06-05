import { cookies } from 'next/headers';
import DefaultLayout from '@/app/components/layout/DefaultLayout'
import ViewTable from '@/app/components/desingation/ViewTable';
import ProtectedRoute from '@/app/components/ProtectedRoute';

async function fetchDesignations(token) {

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/designations`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    if (!res.ok) {
        const errorBody = await res.text();
        console.error('Error fetching designation:', res.status, errorBody);
        throw new Error('Failed to fetch designation data');
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

const page = async () => {
    const token = cookies().get('auth_token')?.value;
    const desingations = await fetchDesignations(token);
    const users = await fetchUsers(token);
    return (
        <DefaultLayout title='All Designations'>
            <ProtectedRoute permissions={['view-designations']}>
                <ViewTable data={desingations.data} users={users.data} />
            </ProtectedRoute>
        </DefaultLayout>
    )
}

export default page