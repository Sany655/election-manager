import EmployeeDetails from "@/app/components/employee/EmployeeDetails";
import DefaultLayout from "@/app/components/layout/DefaultLayout";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { cookies } from 'next/headers';

async function fetchUser(id) {
    const token = cookies().get('auth_token')?.value;
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${id}`, {
        cache: 'no-store',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    if (!res.ok) {
        throw new Error('Failed to fetch data')
    }

    return res.json()
}

const page = async ({ params: { id } }) => {
    const data = await fetchUser(id);

    return (
        <DefaultLayout title="Volunteer Details">
            <ProtectedRoute permissions={['view-volunteers']}>
                <EmployeeDetails user={data.data} />
            </ProtectedRoute>
        </DefaultLayout>
    )
}

export default page