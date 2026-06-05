import { cookies } from 'next/headers';
import DefaultLayout from '@/app/components/layout/DefaultLayout'
import ProtectedRoute from '@/app/components/ProtectedRoute';
import ViewTable from '@/app/components/communication/wa/ViewTable';


const page = async ({ searchParams }) => {
    const token = cookies().get('auth_token')?.value;
    return (
        <DefaultLayout title='WhatsApp Configuration'>
            <ProtectedRoute permissions={['view-whatsapp']}>
                <ViewTable token={token} />
            </ProtectedRoute>
        </DefaultLayout>
    )
}

export default page