import { cookies } from 'next/headers';
import DefaultLayout from '@/app/components/layout/DefaultLayout'
import ProtectedRoute from '@/app/components/ProtectedRoute';
import ViewTable from '@/app/components/event/ViewTable';

async function fetchPolicies(token) {

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events`, {
            cache: 'no-store',
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        if (!res.ok) {
            const errorBody = await res.text();
            console.error('Error fetching polices:', res.status, errorBody);
            throw new Error('Failed to fetch policy data');
        }

        return res.json();
    } catch (error) {
        console.error('Error fetching polices:', error);
    }
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

async function fetchVolunteerTeams(token) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/volunteer-teams`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    if (!res.ok) {
        const errorBody = await res.text();
        console.error('Error fetching volunteer teams:', res.status, errorBody);
        return { data: [] };
    }

    return res.json();
}
const page = async ({ searchParams }) => {
    const token = cookies().get('auth_token')?.value;
    if (!token) {
        redirect('/auth/login');
    }


    const page = parseInt(searchParams?.page || '1');
    const policy = await fetchPolicies(token) || { data: [] };
    const users = await fetchUsers(token);
    const volunteerTeams = await fetchVolunteerTeams(token);

    return (
        <DefaultLayout title='All Activities'>
            <ProtectedRoute permissions={['view-events']}>
                <ViewTable data={policy.data} users={users.data} volunteer_teams={volunteerTeams.data} title='Activity' />
            </ProtectedRoute>
        </DefaultLayout>
    )
}

export default page