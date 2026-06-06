'use client';
import React from 'react';
import DefaultLayout from '@/app/components/layout/DefaultLayout';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

export default function ContactPage() {
    return (
        <DefaultLayout title="Contact Information">
            <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        Contact Quick Panel (QP)
                    </h1>
                    <p className="text-gray-600 mt-1">Need help or support regarding the IEB Election 2026? Reach out to us.</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-xl font-semibold mb-6 text-gray-800">Get in Touch</h2>
                            
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                                        <FaPhone size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Phone Support</h3>
                                        <p className="text-gray-600 mt-1">+880 1234 567 890</p>
                                        <p className="text-gray-600">+880 0987 654 321</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                                        <FaEnvelope size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Email Us</h3>
                                        <p className="text-gray-600 mt-1">support@iebelection2026.org</p>
                                        <p className="text-gray-600">info@iebelection2026.org</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                                        <FaMapMarkerAlt size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Office Address</h3>
                                        <p className="text-gray-600 mt-1">
                                            IEB Headquarters<br />
                                            Ramna, Dhaka 1000<br />
                                            Bangladesh
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">Support Hours</h3>
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li className="flex justify-between">
                                    <span>Sunday - Thursday:</span>
                                    <span className="font-medium">9:00 AM - 6:00 PM</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Friday - Saturday:</span>
                                    <span className="font-medium text-gray-400">Closed</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Election Day:</span>
                                    <span className="font-medium text-blue-600">24/7 Support</span>
                                </li>
                            </ul>

                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <p className="text-sm text-gray-500 italic">
                                    For urgent issues during polling, please use the Emergency Contact numbers provided in your instruction manual.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
}
