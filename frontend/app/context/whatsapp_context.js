'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const WhatsAppContext = createContext();

export const WhatsAppProvider = ({ children, token }) => {
    const [status, setStatus] = useState('Checking...');
    const [qrCode, setQrCode] = useState(null);
    const [sessionDetails, setSessionDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    const getHeaders = () => ({
        Authorization: `Bearer ${token}`
    });

    const fetchStatus = async () => {
        if (!token) return;

        try {
            setLoading(true);
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/whatsapp/session/status`, { headers: getHeaders() });

            if (res.data.success) {
                const data = res.data.data;
                setSessionDetails(data);
                setStatus(data.status);
                setQrCode(data.qrCode);

                if (data.status === 'initializing') {
                    // Poll again if initializing
                    setTimeout(fetchStatus, 2000);
                }

                if (data.status === 'STOPPED') {
                    // Optional: could trigger a toast only if status CHANGED to stopped, 
                    // but keeping simple for now as per original logic
                    toast('Session stopped.', { icon: 'ℹ️', id: 'session-stopped' });
                }
            }
        } catch (error) {
            console.error("Fetch status failed", error);
            setStatus('Error');
            // Avoid spamming toasts on background polling failure unless critical
            toast.error("Failed to fetch session status", { id: 'status-error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, [token]);

    const isReady = status?.toLowerCase() === 'working' || status?.toLowerCase() === 'connected';

    return (
        <WhatsAppContext.Provider value={{
            status,
            qrCode,
            sessionDetails,
            loading,
            isReady,
            fetchStatus, // Expose for manual refresh
            getHeaders // helper if needed by children using same token
        }}>
            {children}
        </WhatsAppContext.Provider>
    );
};

export const useWhatsApp = () => {
    return useContext(WhatsAppContext);
};
