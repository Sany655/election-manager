'use client';


import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthContext } from '../context/auth_context';
import UnauthorizedPage from './Unauthorized';


export default function ProtectedRoute({
  children,
  permissions = [],
  roles = [],
  requireAll = false,
  fallback = <><UnauthorizedPage/></>
}) {
  const { user, isLoading, hasAnyPermission, hasAnyRole, hasPermission, hasRole } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const hasRequiredPermissions = permissions.length === 0 || 
    (requireAll 
      ? permissions.every(perm => hasPermission(perm))
      : hasAnyPermission(permissions)
    );

  const hasRequiredRoles = roles.length === 0 || 
    (requireAll 
      ? roles.every(role => hasRole(role))
      : hasAnyRole(roles)
    );

  if (!hasRequiredPermissions || !hasRequiredRoles) {
    return fallback;
  }

  return <>{children}</>;
}