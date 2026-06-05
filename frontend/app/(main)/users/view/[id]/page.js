import DefaultLayout from "@/app/components/layout/DefaultLayout";
import UserDetails from "@/app/components/user/UserDetails";

async function fetchUser(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${id}`, { cache: 'no-store' })

  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  return res.json()
}

const page = async ({ params: { id } }) => {
  const data = await fetchUser(id);
  return (
    <DefaultLayout>
      <UserDetails user={data.data} />
    </DefaultLayout>
  )
}

export default page