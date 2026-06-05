'use server';
import { cookies } from 'next/headers';
import DefaultLayout from '@/app/components/layout/DefaultLayout'
import ViewTable from '@/app/components/tasks/ViewTable';
import ProtectedRoute from '@/app/components/ProtectedRoute';

async function fetchTasks(token) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tasks`, {
            cache: 'no-store',
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        if (!res.ok) {
            const errorBody = await res.text();
            console.error('Error fetching tasks:', res.status, errorBody);
            // throw new Error('Failed to fetch task data');
        }

        const tasks = await res.json()
        return tasks;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        // throw new Error('Failed to fetch task data');
    }
}

async function fetchUsers(token) {
    try {
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
    } catch (error) {
        console.error('Error fetching user:', error);
    }
}

async function fetchVolunteerTeams(token) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/volunteer-teams`, {
            cache: 'no-store',
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        if (!res.ok) {
            const errorBody = await res.text();
            console.error('Error fetching volunteer-teams:', res.status, errorBody);
            throw new Error('Failed to fetch volunteer-teams data');
        }

        return res.json();
    } catch (error) {
        console.error('Error fetching volunteer-teams:', error);
    }
}

const page = async ({ searchParams }) => {
    const page = parseInt(searchParams?.page || '1');
    const token = cookies().get('auth_token')?.value;
    const tasks = await fetchTasks(token);
    const users = await fetchUsers(token);
    const teams = await fetchVolunteerTeams(token);


    return (
        <DefaultLayout title='All Tasks'>
            <ProtectedRoute permissions={['view-tasks']}>
                <ViewTable
                    data={tasks?.data || []}
                    users={users?.data || []}
                    volunteer_teams={teams?.data || []}
                    title='Task'
                />
            </ProtectedRoute>
        </DefaultLayout>
    )
}

export default page