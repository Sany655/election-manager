import { cookies } from 'next/headers';
import DefaultLayout from '@/app/components/layout/DefaultLayout'
import ViewTable from '@/app/components/tasks/ViewTable';
import ProtectedRoute from '@/app/components/ProtectedRoute';

async function fetchUsers(token) {

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users?role=user`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    if (!res.ok) {
        const errorBody = await res.text();
        console.error('Error fetching polices:', res.status, errorBody);
        throw new Error('Failed to fetch role data');
    }

    return res.json();
}


async function fetchPolicies(token) {

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/polices`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    if (!res.ok) {
        const errorBody = await res.text();
        console.error('Error fetching polices:', res.status, errorBody);
        throw new Error('Failed to fetch role data');
    }

    return res.json();
}

async function fetchSetPolicies(token) {

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/attendance/get-set-polices`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    if (!res.ok) {
        const errorBody = await res.text();
        console.error('Error fetching polices:', res.status, errorBody);
        throw new Error('Failed to fetch role data');
    }

    return res.json();
}

const page = async () => {
    const token = cookies().get('auth_token')?.value;
    const setPolicies = await fetchSetPolicies(token);
    const policies = await fetchPolicies(token);
    const users = await fetchUsers(token);

    return (
        <DefaultLayout title='Set Policy'>
            <ProtectedRoute permissions={['set-holidays']}>
                <ViewTable token={token} users={users.data} set_policies={setPolicies.data} policies={policies.data} />
            </ProtectedRoute>
        </DefaultLayout>
    )
}

export default page