import { cookies } from 'next/headers';
import DefaultLayout from '@/app/components/layout/DefaultLayout'
import ProtectedRoute from '@/app/components/ProtectedRoute';
import Overview from '@/app/components/employee/Overview';


async function fetchUserRoles(token) {

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/roles`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    if (!res.ok) {
        const errorBody = await res.text();
        console.error('Error fetching roles:', res.status, errorBody);
        throw new Error('Failed to fetch role data');
    }

    return res.json();
}

async function fetchPolicies(token) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/policies`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    if (!res.ok) {
        const errorBody = await res.text();
        console.error('Error fetching policies:', res.status, errorBody);
        throw new Error('Failed to fetch policies data');
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

async function fetchDesignations(token) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/designations`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    if (!res.ok) {
        const errorBody = await res.text();
        console.error('Error fetching desingnation:', res.status, errorBody);
        throw new Error('Failed to fetch desingnation data');
    }

    return res.json();
}

async function fetchVolunteerStats(token) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/dashboard/volunteer-stats`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    if (!res.ok) {
        // Log but don't crash, return empty/default
        console.error('Error fetching volunteer stats:', res.status);
        return { stats: [], upcomingTasks: [], recentActivities: [] };
    }

    return res.json();
}

const page = async ({ searchParams }) => {
    const page = parseInt(searchParams?.page || '1');
    const token = cookies().get('auth_token')?.value;
    const roleData = await fetchUserRoles(token);
    const policies = await fetchPolicies(token);
    const locations = await fetchLocations(token);
    const designations = await fetchDesignations(token);
    const statsData = await fetchVolunteerStats(token);

    return (
        <DefaultLayout title='Overview'>
            <ProtectedRoute permissions={['view-volunteer-overview']}>
                <Overview
                    token={token}
                    roles={roleData.data}
                    policies={policies.data}
                    locations={locations.data}
                    designations={designations.data}
                    renderFrom='employee'
                    title='Volunteer'
                    statsData={statsData}
                />
            </ProtectedRoute>
        </DefaultLayout>
    )
}

export default page