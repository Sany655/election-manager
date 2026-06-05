import { cookies } from 'next/headers';
import DefaultLayout from '@/app/components/layout/DefaultLayout'
import ProtectedRoute from '@/app/components/ProtectedRoute';
import ViewTable from '@/app/components/location/ViewTable';


async function fetchData(token, page = 1) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/districts?page=${page}`, {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
        console.log('Failed to fetch data', res.statusText)
    }
    const data = await res.json();
    return data;
}


const page = async ({ searchParams }) => {
    const token = cookies().get('auth_token')?.value;
    const itemsPage = searchParams?.page || 1;
    const data = await fetchData(token, itemsPage);

    if (data.data) {
        data.data = data.data.map(item => ({
            ...item,
            division_name: item.division?.name || item.division?.bn_name || "-"
        }));
    }

    const columns = [
        { header: "Division", accessor: "division_name" }
    ];

    return (
        <DefaultLayout title='District'>
            <ProtectedRoute permissions={['view-districts']}>
                <ViewTable
                    data={data}
                    token={token}
                    title='District'
                    apiPath={`${process.env.NEXT_PUBLIC_BASE_URL}/api/districts`}
                    permissionPrefix='district'
                    columns={columns}
                />
            </ProtectedRoute>
        </DefaultLayout>
    )
}

export default page