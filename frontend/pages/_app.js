import "../styles/globals.css";
import { useState, useEffect, useCallback } from "react";
import liff from "@line/liff";
import { useRouter } from "next/router";
import { logInfo, logError } from "../utils/logger";

/**
 * SousBotLIFFApp - Main application wrapper that handles LIFF initialization
 * and authentication flow for the SousBot bakery management application
 */
function SousBotLIFFApp({ Component, pageProps }) {
  const [liffObject, setLiffObject] = useState(null);
  const [liffError, setLiffError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lineId, setLineId] = useState(null);
  const [displayName, setDisplayName] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  
  // Safe access to browser APIs
  const isBrowser = typeof window !== 'undefined';
  
  // Storage helpers
  const saveToStorage = useCallback((key, value) => {
    if (isBrowser) {
      try {
        sessionStorage.setItem(key, value);
      } catch (e) {
        logError("Error saving to sessionStorage", { error: e });
      }
    }
  }, [isBrowser]);
  
  const getFromStorage = useCallback((key) => {
    if (isBrowser) {
      try {
        return sessionStorage.getItem(key);
      } catch (e) {
        logError("Error reading from sessionStorage", { error: e });
        return null;
      }
    }
    return null;
  }, [isBrowser]);

  // Helper to extract userId from path (e.g., /menu-management/U12345)
  const extractUserIdFromPath = useCallback(() => {
    if (!isBrowser) return null;
    
    const pathSegments = router.asPath.split('?')[0].split('/').filter(Boolean);
    
    // Check if the last segment looks like a LINE userId (typically starts with 'U')
    if (pathSegments.length > 0) {
      const lastSegment = pathSegments[pathSegments.length - 1];
      if (lastSegment && lastSegment.startsWith('U')) {
        return lastSegment;
      }
    }
    
    return null;
  }, [router.asPath, isBrowser]);

  // Handler for saving user profile information
  const saveUserProfile = useCallback((profile) => {
    if (!profile || !profile.userId) return;
    
    saveToStorage('lineId', profile.userId);
    saveToStorage('displayName', profile.displayName);
    saveToStorage('isAuthenticated', 'true');
    
    setLineId(profile.userId);
    setDisplayName(profile.displayName);
    setIsAuthenticated(true);
    
    logInfo("User profile saved", { userId: profile.userId });
  }, [saveToStorage]);

  // 1. LIFF INITIALIZATION - Only happens once when the app loads
  useEffect(() => {
    if (!isBrowser) return;
    
    async function initLIFF() {
      logInfo("SousBot: Initializing LIFF SDK...");
      
      if (!process.env.NEXT_PUBLIC_LIFF_ID) {
        const error = "Missing NEXT_PUBLIC_LIFF_ID environment variable";
        logError("SousBot: " + error);
        setLiffError(error);
        return;
      }
      
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID });
        logInfo("SousBot: LIFF SDK initialized successfully");
        setLiffObject(liff);
        setIsInitialized(true);
      } catch (error) {
        logError("SousBot: LIFF SDK initialization failed", { error });
        setLiffError(error.toString());
      }
    }

    initLIFF();
  }, [isBrowser]); // Only run once on client-side

  // 2. SESSION RESTORATION - Check for existing session
  useEffect(() => {
    if (!isBrowser) return;
    
    const storedLineId = getFromStorage('lineId');
    const storedAuth = getFromStorage('isAuthenticated');
    const storedName = getFromStorage('displayName');
    
    if (storedLineId && storedAuth === 'true') {
      setLineId(storedLineId);
      setIsAuthenticated(true);
      
      if (storedName) {
        setDisplayName(storedName);
      }
      
      logInfo("Session restored from storage", { userId: storedLineId });
    }
  }, [isBrowser, getFromStorage]);

  // 3. AUTHENTICATION & NAVIGATION - Handles login and redirects after LIFF is initialized
  useEffect(() => {
    if (!isBrowser || !isInitialized || !liffObject) return;
    
    async function handleAuthentication() {
      try {
        // Get userId from path (if present)
        const pathUserId = extractUserIdFromPath();
        
        // If user is logged in to LINE
        if (liffObject.isLoggedIn()) {
          try {
            const profile = await liffObject.getProfile();
            saveUserProfile(profile);
            
            // Handle special case for root path with LIFF state
            if (router.pathname === "/" && window.location.href.includes("liff.state")) {
              const isUserRegistered = getFromStorage('lineId') !== null;
              
              if (!isUserRegistered) {
                logInfo("New user, redirecting to registration");
                router.replace("/register");
              } else {
                logInfo("Returning user, redirecting to dashboard");
                router.replace(`/dashboard?userId=${profile.userId}`);
                // Or if you prefer the URL structure with the userId in the path:
                // router.replace(`/${profile.userId}`);
              }
              return;
            }
            
            // If we're on a path with a userId, verify it matches or handle accordingly
            if (pathUserId) {
              // If needed, you could validate pathUserId == profile.userId here
              // For now we'll trust the path userId as it comes from your bot
              logInfo("Path contains userId, continuing with current path", { pathUserId });
              // Stay on current path
            }
          } catch (profileError) {
            logError("Error getting LINE profile", { error: profileError });
          }
        }
        // User is not logged in
        else {
          // If not on register page, redirect to LINE login
          if (router.pathname !== "/register") {
            logInfo("User not logged in, redirecting to LINE login");
            // Optionally store current path to return after login
            if (isBrowser) {
              sessionStorage.setItem('loginRedirectPath', router.asPath);
            }
            liffObject.login();
          }
        }
      } catch (error) {
        logError("Authentication error", { error });
      }
    }
    
    handleAuthentication();
  }, [isInitialized, liffObject, router.pathname, router.asPath, isBrowser, extractUserIdFromPath, getFromStorage, saveUserProfile, router]);

  // Provide app context to all components
  pageProps.liff = liffObject;
  pageProps.liffError = liffError;
  pageProps.isAuthenticated = isAuthenticated;
  pageProps.lineId = lineId;
  pageProps.displayName = displayName;

  return <Component {...pageProps} />;
}

// Make sure environment variables are properly exposed to the browser
export function reportEnvVars() {
  if (typeof window !== 'undefined') {
    if (!process.env.NEXT_PUBLIC_LIFF_ID) {
      console.warn('NEXT_PUBLIC_LIFF_ID environment variable is not defined');
    }
  }
}

export default SousBotLIFFApp;