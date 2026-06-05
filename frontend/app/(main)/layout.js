import { cookies } from 'next/headers';
import { WhatsAppProvider } from '../context/whatsapp_context';

export default async function MainLayout({ children }) {
    const token = cookies().get('auth_token')?.value;

    return (
        <WhatsAppProvider token={token}>
            {children}
        </WhatsAppProvider>
    );
}
