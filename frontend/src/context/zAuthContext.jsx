import { createContext, useContext, useEffect, useState } from "react";
import { AuthServices } from "../services/authService";
import { setAuthToken } from "../services/api";
// import { AuthServices } from "../services/authentication";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [refreshTimer, setRefreshTimer] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const startTokenRefreshCycle = (accessToken, expiresAt) => {
    console.log("Starting token refresh cycle");

    // Update token and auth state immediately
    setToken(accessToken);
    setIsAuthenticated(true);
    setAuthToken(accessToken); // Update API client

    // Clear any existing timer
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }

    // Calculate time until refresh (2 minutes before expiry)
    const expiry = new Date(expiresAt);
    const now = new Date();
    const timeUntilExpiry = Math.floor((expiry - now) / 1000) - 120;

    // Schedule the refresh
    if (timeUntilExpiry > 0) {
      const timerId = setTimeout(() => {
        setRefreshTimer(null);
        tryRefresh(); // This will handle the internal refresh
      }, timeUntilExpiry * 1000);

      setRefreshTimer(timerId);
    }
  };

  const logout = () => {
    setToken(null);
    setIsAuthenticated(false);
    // Shoudl make api call which destroys refresh token
  };

  const tryRefresh = async () => {
    if (isRefreshing) {
      console.log("Refresh already in progress, skipping");
      return;
    }

    console.log("Auto-refreshing token");
    setIsRefreshing(true);

    try {
      const response = await AuthServices.refresh_token();

      if (response.success) {
        const { access_token, expires_at } = response.data;

        // Use the external function to restart the cycle
        startTokenRefreshCycle(access_token, expires_at);
      } else {
        // Handle refresh failure - logout user
        logout();
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
    } finally {
      setIsRefreshing(false);
    }
  };

  // const tryRefresh = async () => {
  //   if (isRefreshing) {
  //     console.log("Refresh already in progress, skipping");
  //     return;
  //   }
  //
  //   console.log("refreshing");
  //   setIsRefreshing(true);
  //
  //   const response = await AuthServices.refresh_token();
  //   if (response.success) {
  //     const expiresAt = new Date(response.data?.expires_at);
  //     const now = new Date();
  //     const timeUntilExpiry = Math.floor((expiresAt - now) / 1000) - 120; // 2 minutes before expiry
  //
  //     // Update token and auth state immediately
  //     setToken(response.data?.access_token);
  //     setIsAuthenticated(true);
  //
  //     if (refreshTimer) {
  //       clearTimeout(refreshTimer);
  //     }
  //
  //     // Schedule next refresh
  //     if (timeUntilExpiry > 0) {
  //       const timerId = setTimeout(() => {
  //         setRefreshTimer(null); // Clear timer to allow next refresh
  //         tryRefresh(); // Trigger next refresh
  //       }, timeUntilExpiry * 1000);
  //
  //       setRefreshTimer(timerId);
  //     }
  //   } else {
  //     // Handle refresh failure
  //     setIsAuthenticated(false);
  //     setToken(null);
  //   }
  // };

  useEffect(() => {
    // Only run on mount or when refreshTimer is cleared
    if (!refreshTimer) {
      tryRefresh();
    }

    // Cleanup timer on unmount
    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
    };
  }, [refreshTimer]);

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        isAuthenticated,
        logout,
        startTokenRefreshCycle,
        // login,
        // mfaRequired,
        // setupMfaRequired,
        // setSetupMfaRequired,
        // setMfaRequired,
        // completeMfaLogin,
        // completeMfaSetup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
