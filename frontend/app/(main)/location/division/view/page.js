import { cookies } from 'next/headers';
import DefaultLayout from '@/app/components/layout/DefaultLayout'
import ProtectedRoute from '@/app/components/ProtectedRoute';
import ViewTable from '@/app/components/location/ViewTable';


async function fetchDivisions(token, page = 1) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/divisions?page=${page}`, {
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        }
    });

    if (!res.ok) {
        console.log('Failed to fetch data', res.statusText)
    }
    const data = await res.json()
    return data
}


const page = async ({ searchParams }) => {
    const token = cookies().get('auth_token')?.value;
    const itemsPage = searchParams?.page || 1;
    const data = await fetchDivisions(token, itemsPage);

    return (
        <DefaultLayout title='Division'>
            <ProtectedRoute permissions={['view-divisions']}>
                <ViewTable
                    data={data}
                    token={token}
                    title='Division'
                    apiPath={`${process.env.NEXT_PUBLIC_BASE_URL}/api/divisions`}
                    permissionPrefix='division'
                />
            </ProtectedRoute>
        </DefaultLayout>
    )
}

export default page