import { cookies } from 'next/headers';
import DefaultLayout from '@/app/components/layout/DefaultLayout'
import ProtectedRoute from '@/app/components/ProtectedRoute';
import ViewTable from '@/app/components/location/ViewTable';


async function fetchData(token, page = 1) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/wards?page=${page}`, {
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
            union_name: item.union?.name || item.union?.bn_name || "-"
        }));
    }

    const columns = [
        { header: "Union", accessor: "union_name" }
    ];

    return (
        <DefaultLayout title='Ward'>
            <ProtectedRoute permissions={['view-wards']}>
                <ViewTable
                    data={data}
                    token={token}
                    title='Ward'
                    apiPath={`${process.env.NEXT_PUBLIC_BASE_URL}/api/wards`}
                    permissionPrefix='ward'
                    columns={columns}
                />
            </ProtectedRoute>
        </DefaultLayout>
    )
}

export default page