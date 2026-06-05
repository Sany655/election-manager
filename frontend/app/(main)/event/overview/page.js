import { cookies } from 'next/headers';
import DefaultLayout from '@/app/components/layout/DefaultLayout'
import ProtectedRoute from '@/app/components/ProtectedRoute';
import Overview from '@/app/components/event/Overview';



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

async function fetchEvents(token) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    if (!res.ok) {
        const errorBody = await res.text();
        console.error('Error fetching event:', res.status, errorBody);
        throw new Error('Failed to fetch event data');
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
    const events = await fetchEvents(token);

    return (
        <DefaultLayout title='Overview'>
            <ProtectedRoute permissions={['view-event-overview']}>
                <Overview
                    token={token}
                    roles={roleData.data}
                    policies={policies.data}
                    locations={locations.data}
                    designations={designations.data}
                    events={events.data}
                    renderFrom='employee'
                    title='Event'
                />
            </ProtectedRoute>
        </DefaultLayout>
    )
}

export default page