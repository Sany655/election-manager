'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { HiHome, HiArrowLeft } from 'react-icons/hi'
import { MdError } from 'react-icons/md'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DefaultLayout from './components/layout/DefaultLayout'

const NotFound = () => {
    const router = useRouter()

    return (
        <DefaultLayout>
            <div className=" bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    {/* 404 Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="flex justify-center mb-8"
                    >
                        <div className="relative">
                            <MdError className="text-9xl text-red-500" />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-4 border-red-200 border-t-red-500 rounded-full"
                            />
                        </div>
                    </motion.div>

                    {/* 404 Text */}
                    <motion.h3
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-5xl font-bold text-gray-800 mb-4"
                    >
                        404
                    </motion.h3>

                    {/* Message */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2 className="text-3xl font-semibold text-gray-700 mb-4">
                            Page Not Found
                        </h2>
                        
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border border-gray-200"
                        >
                            <HiArrowLeft className="text-xl" />
                            Go Back
                        </button>

                        <Link
                            href="/"
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700"
                        >
                            <HiHome className="text-xl" />
                            Go Home
                        </Link>
                    </motion.div>

                    
                </motion.div>
            </div>
        </DefaultLayout>
    )
}

export default NotFound