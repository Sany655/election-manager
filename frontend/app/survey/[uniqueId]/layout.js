
import { APP_NAME } from "@/app/utils/constants";

export async function generateMetadata({ params }) {
    const { uniqueId } = params;

    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8001';
        const res = await fetch(`${baseUrl}/api/surveys/public/${uniqueId}`, { next: { revalidate: 0 } });
        if (!res.ok) {
            return {
                title: 'Survey',
                description: 'Participate in this survey'
            }
        }
        const data = await res.json();
        return {
            title: data.title,
            description: data.description || `Participate in ${data.title}`,
            openGraph: {
                title: data.title,
                description: data.description
            }
        }
    } catch (e) {
        console.error("Meta fetch error", e);
        return {
            title: 'Survey',
            description: 'Participate in this survey'
        }
    }
}

export default function Layout({ children }) {
    return <>{children}</>;
}
