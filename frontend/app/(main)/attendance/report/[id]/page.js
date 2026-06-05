import ReportDetails from "@/app/components/attendance/ReportDetails";
import DefaultLayout from "@/app/components/layout/DefaultLayout";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { cookies } from 'next/headers';

const page = async ({ params: { id } }) => {
  const token = cookies().get('auth_token')?.value;
  return (
    <DefaultLayout>
        <ReportDetails token={token} id={id} />
      {/* <ProtectedRoute permissions={['view-attendance-reports']}>
      </ProtectedRoute> */}
    </DefaultLayout>
  )
}

export default page