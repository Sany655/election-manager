import DefaultLayout from "@/app/components/layout/DefaultLayout";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { cookies } from 'next/headers';
import RoadmapClient from "./RoadmapClient";

async function fetchCampaigns(token) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/campaigns`, {
            cache: 'no-store',
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        if (!res.ok) {
            console.error('Error fetching campaigns:', res.status);
            return { data: [] };
        }

        return await res.json();
    } catch (error) {
        console.error('Failed to fetch campaigns:', error);
        return { data: [] };
    }
}

const RoadmapPage = async () => {
    const token = cookies().get('auth_token')?.value;
    const campaignsResponse = await fetchCampaigns(token);
    const campaigns = campaignsResponse.data || [];

    return (
        <DefaultLayout title='Campaign Roadmap'>
            <ProtectedRoute permissions={['view-campaign-roadmap']}>
                <RoadmapClient initialData={campaigns} />
            </ProtectedRoute>
        </DefaultLayout>
    );
};

export default RoadmapPage;