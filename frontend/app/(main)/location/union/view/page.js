import { cookies } from 'next/headers';
import DefaultLayout from '@/app/components/layout/DefaultLayout'
import ProtectedRoute from '@/app/components/ProtectedRoute';
import ViewTable from '@/app/components/location/ViewTable';


async function fetchData(token, page = 1) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/unions?page=${page}`, {
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
            upazilla_name: item.upazilla?.name || item.upazilla?.bn_name || "-"
        }));
    }

    const columns = [
        { header: "Thana", accessor: "upazilla_name" }
    ];

    return (
        <DefaultLayout title='Union'>
            <ProtectedRoute permissions={['view-unions']}>
                <ViewTable
                    data={data}
                    token={token}
                    title='Union'
                    apiPath={`${process.env.NEXT_PUBLIC_BASE_URL_FOR_CLIENT}/api/unions`}
                    permissionPrefix='union'
                    columns={columns}
                />
            </ProtectedRoute>
        </DefaultLayout>
    )
}

export default page