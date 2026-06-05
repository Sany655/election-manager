'use client'
import DefaultLayout from '@/app/components/layout/DefaultLayout'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const page = () => {
  const router = useRouter()
  useEffect(() => {
    router.push('/users/profile')
  }, [])
  return (
    <ProtectedRoute>
      <DefaultLayout>

      </DefaultLayout>
    </ProtectedRoute>
  )
}

export default page