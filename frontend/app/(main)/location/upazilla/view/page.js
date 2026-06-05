import { cookies } from 'next/headers';
import DefaultLayout from '@/app/components/layout/DefaultLayout'
import ProtectedRoute from '@/app/components/ProtectedRoute';
import ViewTable from '@/app/components/location/ViewTable';


async function fetchData(token, page = 1) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/upazillas?page=${page}`, {
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
            district_name: item.district?.name || item.district?.bn_name || "-"
        }));
    }

    const columns = [
        { header: "District", accessor: "district_name" }
    ];

    return (
        <DefaultLayout title='Thana'>
            <ProtectedRoute permissions={['view-upazillas']}>
                <ViewTable
                    data={data}
                    token={token}
                    title='Thana' // Frontend uses Thana via menu but model is Upazilla
                    apiPath={`${process.env.NEXT_PUBLIC_BASE_URL_FOR_CLIENT}/api/upazillas`}
                    permissionPrefix='upazilla'
                    columns={columns}
                />
            </ProtectedRoute>
        </DefaultLayout>
    )
}

export default page