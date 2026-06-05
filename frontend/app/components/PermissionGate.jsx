'use client';
import { useAuthContext } from "../context/auth_context";

const PermissionGate = ({ 
  children, 
  roles = [], 
  permissions = [], 
  fallback = null,
  requireAll = false 
}) => {
  const { hasAnyRole, hasAnyPermission, hasRole, hasPermission } = useAuthContext();

  const hasRequiredRoles = roles.length === 0 || 
    (requireAll ? roles.every(role => hasRole(role)) : hasAnyRole(roles));

  const hasRequiredPermissions = permissions.length === 0 || 
    (requireAll ? permissions.every(perm => hasPermission(perm)) : hasAnyPermission(permissions));

  if (hasRequiredRoles && hasRequiredPermissions) {
    return children;
  }

  return fallback;
};

export default PermissionGate;