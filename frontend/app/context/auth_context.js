'use client'

import { useRouter } from "next/navigation";
import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [isError, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const res = await fetch('/frontapi/auth/me');
        if (res.ok) {
          const result = await res.json();
          // The backend /me endpoint returns { success: true, data: user }
          if (result.success && result.data) {
            setUser(result.data);
            setRoles(result.data.roles || []);
            setPermissions(result.data.roles?.[0]?.permissions || []);
          }
        }
      } catch (error) {
        // console.error("Session check failed", error);
        // User not logged in or error
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  const login = async (form) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/frontapi/login`, {
        method: 'POST',
        body: JSON.stringify({
          email: form.get('email'),
          password: form.get('password'),
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (res.ok) {
        if (data) {
          // Token is set in cookie by the /frontapi/login route
          // We just need to update the state
          const userData = data.data; // Login endpoint returns { msg, token, data: user }

          setUser(userData);
          setRoles(userData?.roles || []);
          setPermissions(userData?.roles?.[0]?.permissions || []);

          // Check permission directly from the response data
          // const userHasManualAttendancePermission = userData?.roles?.some(role =>
          //   role.permissions?.some(perm => perm.name === 'take-manual-attendance')
          // );

          // // Redirect based on permission
          // if (userHasManualAttendancePermission) {
          //   router.push('/attendance/manual');
          // } else {
          //   router.push('/');
          // }
        }
        router.push('/');
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    // frontend/app/components/user/Logout.jsx handles calling /frontapi/logout
    // Here we just clear the state
    setUser(null);
    setRoles([]);
    setPermissions([]);
    router.push('/');
    return true;
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    return user.roles?.some(role =>
      role.permissions?.some(perm => perm.name === permission)
    );
  };

  const hasRole = (role) => {
    if (!user) return false;
    return user.roles?.some(userRole => userRole.name === role);
  };

  const hasAnyPermission = (permissions) => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAnyRole = (roles) => {
    return roles.some(role => hasRole(role));
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      login,
      logout,
      isLoading,
      isError,
      permissions,
      hasRole,
      hasPermission,
      hasAnyRole,
      hasAnyPermission,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}