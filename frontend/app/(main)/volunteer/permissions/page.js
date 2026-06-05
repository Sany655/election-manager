import { cookies } from 'next/headers';
import DefaultLayout from '@/app/components/layout/DefaultLayout'
import ViewTable from '@/app/components/employee/permission/ViewTable';
import ProtectedRoute from '@/app/components/ProtectedRoute';

async function fetchPermissions(token) {

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/permissions`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    if (!res.ok) {
        const errorBody = await res.text();
        console.error('Error fetching permissions:', res.status, errorBody);
        throw new Error('Failed to fetch permissions data');
    }

    return res.json();
}
const page = async ({ searchParams }) => {
    const token = cookies().get('auth_token')?.value;
    const page = parseInt(searchParams?.page || '1');
    const permissions = await fetchPermissions(token);

    return (
        <DefaultLayout title='All Permissions'>
            <ProtectedRoute permissions={['view-permissions']}>
                <ViewTable data={permissions.data} />
            </ProtectedRoute>
        </DefaultLayout>
    )
}

export default page