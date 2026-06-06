'use client'
import React from 'react'
import DefaultLayout from '@/app/components/layout/DefaultLayout'
import ProtectedRoute from '@/app/components/ProtectedRoute'

// TODO: Replace with your actual dashboard embed URL for the 9th National Election Results
// In Looker Studio, configure this report to show the overall election results and center-wise voting details.
// const ELECTION_DASHBOARD_EMBED_URL = process.env.NEXT_ELECTION_DASHBOARD_EMBED_URL

export default function ElectionResultsPage() {
    return (
        <DefaultLayout title="9th-Election Results">
            <ProtectedRoute permissions={['view-election-9th']}>
                <div className="w-full h-[calc(100vh-130px)] bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm relative">
                    {process.env.NEXT_PUBLIC_ELECTION_DASHBOARD_EMBED_URL ? (
                        <iframe
                            src={process.env.NEXT_PUBLIC_ELECTION_DASHBOARD_EMBED_URL}
                            className="w-full h-full border-0"
                            frameBorder="0"
                            // allowFullScreen
                            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                            title="9th National Election Results Visualization"
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gray-50">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 max-w-md">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Setup Election Visualization</h3>
                                <p className="text-gray-600 mb-4">
                                    This page is ready to display the 9th National Election Data.
                                </p>
                                {/* <div className="bg-gray-100 p-3 rounded-lg text-xs font-mono text-left overflow-auto mb-4 border border-gray-200">
                                    app/(main)/9th-election/page.jsx
                                    <br />
                                    <span className="text-blue-600">const ELECTION_DASHBOARD_EMBED_URL = 'YOUR_URL_HERE'</span>
                                </div> */}
                                <p className="text-sm text-gray-500">
                                    Connect looker studio to show the <br />
                                    <strong>Election Results & Center-wise voting</strong>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </ProtectedRoute>
        </DefaultLayout>
    )
}
