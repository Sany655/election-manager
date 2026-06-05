import { cookies } from 'next/headers';
import DefaultLayout from '@/app/components/layout/DefaultLayout'
import ViewTable from '@/app/components/employee/role/ViewTable';
import ProtectedRoute from '@/app/components/ProtectedRoute';


async function fetchRoles(token) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/roles`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    if (!res.ok) {
        const errorBody = await res.text();
        console.error('Error fetching roles:', res.status, errorBody);
        throw new Error('Failed to fetch roles data');
    }

    return res.json();
}

async function fetchPermissions(token) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/permissions`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    if (!res.ok) {
        const errorBody = await res.text();
        console.error('Error fetching permission:', res.status, errorBody);
        throw new Error('Failed to fetch permission data');
    }

    return res.json();
}

const page = async ({ searchParams }) => {
    const token = cookies().get('auth_token')?.value;
    const page = parseInt(searchParams?.page || '1');
    const roles = await fetchRoles(token);
    const permissions = await fetchPermissions(token);

    return (
        <DefaultLayout title='All Roles'>
            <ProtectedRoute permissions={['view-roles']}>
                <ViewTable data={roles.data} permissions={permissions.data} />
            </ProtectedRoute>
        </DefaultLayout>
    )
}

export default page