import { cookies } from 'next/headers';
import DefaultLayout from '@/app/components/layout/DefaultLayout'
import ProtectedRoute from '@/app/components/ProtectedRoute';
import ViewTable from '@/app/components/employee/volunteer_team/ViewTable';



async function fetchTeams(token) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/volunteer-teams`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    if (!res.ok) {
        throw new Error('Failed to fetch team data')
    }

    return res.json()
}

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
    const page = parseInt(searchParams?.page || '1');
    const data = await fetchTeams(token);
    const users = await fetchUsers(token);
    return (
        <DefaultLayout title='All Teams'>
            <ProtectedRoute permissions={['view-teams']}>
                <ViewTable data={data.data} token={token} users={users.data} title='Team' />
            </ProtectedRoute>
        </DefaultLayout>
    )
}

export default page