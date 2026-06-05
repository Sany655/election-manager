import { cookies } from 'next/headers';
import DefaultLayout from '@/app/components/layout/DefaultLayout'
import ViewTable from '@/app/components/employee/ViewTable';
import ProtectedRoute from '@/app/components/ProtectedRoute';


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



const page = async ({ searchParams }) => {
    const page = parseInt(searchParams?.page || '1');
    const token = cookies().get('auth_token')?.value;
    const roleData = await fetchUserRoles(token);
    const policies = await fetchPolicies(token);
    const locations = await fetchLocations(token);
    const designations = await fetchDesignations(token);

    return (
        <DefaultLayout title='All Volunteer'>
            <ProtectedRoute permissions={['view-volunteers']}>
                <ViewTable
                    token={token}
                    roles={roleData.data}
                    policies={policies.data}
                    locations={locations.data}
                    designations={designations.data}
                    renderFrom='volunteer'
                    title='Volunteer'
                />
            </ProtectedRoute>
        </DefaultLayout>
    )
}

export default page