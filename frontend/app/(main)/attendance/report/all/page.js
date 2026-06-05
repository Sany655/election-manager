import AllViewTable from '@/app/components/attendance/AllViewTable';
import DefaultLayout from '@/app/components/layout/DefaultLayout'
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { cookies } from 'next/headers';

async function fetchUsers(token) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users?role=user`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    if (!res.ok) {
        const errorBody = await res.text();
        console.error('Error fetching users:', res.status, errorBody);
        throw new Error('Failed to fetch users');
    }

    return res.json();
}
async function fetchLocations(token) {


    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/locations`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    if (!res.ok) {
        const errorBody = await res.text();
        console.error('Error fetching location:', res.status, errorBody);
        throw new Error('Failed to fetch location data');
    }

    return res.json();
}
async function fetchAreas(token) {


    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/areas`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    if (!res.ok) {
        const errorBody = await res.text();
        console.error('Error fetching area:', res.status, errorBody);
        throw new Error('Failed to fetch area data');
    }

    return res.json();
}

const page = async () => {
    const token = cookies().get('auth_token')?.value;
    const users = await fetchUsers(token);
    const locations = await fetchLocations(token);
    const areas = await fetchAreas(token);

    return (
            <DefaultLayout title='All Report'>
                <AllViewTable renderFrom='all' token={token} locations={locations.data} areas={areas.data} users={users.data} />
            </DefaultLayout>
        // <ProtectedRoute permissions={['view-attendance-reports']} >
        // </ProtectedRoute>
    )
}

export default page