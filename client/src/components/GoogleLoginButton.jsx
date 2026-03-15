import React, { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserLogin } from "@/redux/slices/authSlice";
import { useToast } from "@/hooks/use-toast";

const GoogleLoginButton = ({ type = "redirect" }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  console.log("🔧 GoogleLoginButton rendered with type:", type);
  console.log("🔑 VITE_GOOGLE_CLIENT_ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);
  console.log("🌐 VITE_API_URL:", import.meta.env.VITE_API_URL);

  // ✅ Method 1: Web Redirect Flow
  const handleRedirectLogin = async (e) => {
    e?.preventDefault(); // Form submit hone se rokega
    console.log("🔄 Redirect login started");
    console.log("📡 Calling backend URL:", `${import.meta.env.VITE_API_URL}/auth/google/url`);
    
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/google/url`,
      );
      console.log("✅ Redirect URL received:", res.data.url);
      console.log("🚀 Redirecting to Google...");
      window.location.href = res.data.url;
    } catch (error) {
      console.error("❌ Google redirect login failed:", error);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error message:", error.message);
      toast({
        title: "Login Failed",
        description: error.response?.data?.message || "Could not connect to Google",
        variant: "destructive",
      });
    }
  };

  // ✅ Method 2: Token Flow (Google One Tap)
  const handleTokenLogin = (e) => {
    e?.preventDefault(); // Form submit hone se rokega
    console.log("🔄 Token login started");
    console.log("🔑 Using Client ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);
    
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="gsi/client"]');
    console.log("📦 Existing Google script:", existingScript);
    
    if (existingScript) {
      console.log("✅ Google script already loaded");
      if (window.google) {
        console.log("✅ window.google object exists");
        initializeGoogleSignIn();
      } else {
        console.error("❌ window.google not found even though script exists");
      }
      return;
    }

    console.log("📦 Creating new Google script element");
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log("✅✅✅ Google script loaded SUCCESSFULLY");
      console.log("🔍 window.google exists after load:", !!window.google);
      console.log("🔍 window.google.accounts:", window.google?.accounts);
      initializeGoogleSignIn();
    };
    
    script.onerror = (error) => {
      console.error("❌❌❌ Failed to load Google script:", error);
      console.error("❌ Script error details:", error);
      toast({
        title: "Error",
        description: "Failed to load Google Sign-In. Please try redirect login.",
        variant: "destructive",
      });
      console.log("🔄 Falling back to redirect login");
      handleRedirectLogin();
    };
    
    console.log("📦 Appending script to document.body");
    document.body.appendChild(script);
    console.log("✅ Script appended");
  };

  const initializeGoogleSignIn = () => {
    console.log("🔧 initializeGoogleSignIn called");
    
    if (!window.google) {
      console.error("❌❌❌ Google object not found in initializeGoogleSignIn");
      return;
    }

    if (!window.google.accounts) {
      console.error("❌❌❌ Google accounts not found");
      return;
    }

    if (!window.google.accounts.id) {
      console.error("❌❌❌ Google accounts.id not found");
      return;
    }

    try {
      console.log("🔧 Initializing Google Sign-In with client ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);
      
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      console.log("✅✅✅ Google Sign-In initialized successfully");
      
      // Show the One Tap prompt
      console.log("🔧 Calling window.google.accounts.id.prompt()");
      window.google.accounts.id.prompt((notification) => {
        console.log("📢📢📢 Google prompt notification received:", notification);
        console.log("📢 Notification type:", notification.getNotDisplayedReason?.());
        console.log("📢 Notification details:", {
          isNotDisplayed: notification.isNotDisplayed(),
          isSkippedMoment: notification.isSkippedMoment(),
          isDismissedMoment: notification.isDismissedMoment(),
          isDisplayMoment: notification.isDisplayMoment()
        });
        
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.warn("⚠️⚠️⚠️ Google prompt not displayed, reason:", notification.getNotDisplayedReason?.());
          console.log("🔄 Falling back to redirect login");
          handleRedirectLogin();
        }
      });

    } catch (error) {
      console.error("❌❌❌ Google initialization error:", error);
      console.error("❌ Error name:", error.name);
      console.error("❌ Error message:", error.message);
      console.error("❌ Error stack:", error.stack);
    }
  };

  const handleGoogleResponse = async (response) => {
    console.log("✅✅✅ Google response received at:", new Date().toISOString());
    console.log("📦 Google response object:", response);
    console.log("📦 Response credential exists:", !!response.credential);
    console.log("📦 Response credential length:", response.credential?.length);
    
    try {
      console.log("📡 Sending token to backend:", `${import.meta.env.VITE_API_URL}/auth/google/token`);
      console.log("📤 Request payload:", { token: response.credential?.substring(0, 20) + "..." });
      
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/google/token`,
        { token: response.credential },
      );

      console.log("✅✅✅ Backend response received:", res);
      console.log("📦 Backend response data:", res.data);
      console.log("📦 User data:", res.data.user);
      console.log("📦 Token:", res.data.token?.substring(0, 20) + "...");

      // ✅ FIXED: Directly pass res.data (no extra wrapping)
      console.log("🔧 Dispatching to Redux with setUserLogin");
      dispatch(setUserLogin(res.data));

      console.log("✅ Redux dispatch successful");
      
      toast({
        title: "Login Successful",
        description: `Welcome ${res.data.user?.name || "User"}!`,
      });

      console.log("🚀 Redirecting to home page");
      window.location.href = "/";
      
    } catch (error) {
      console.error("❌❌❌ Google backend login failed:", error);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error data:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error message:", error.message);
      
      toast({
        title: "Login Failed",
        description: error.response?.data?.message || "Google authentication failed",
        variant: "destructive",
      });
    }
  };

  // ✅ FIXED: Main click handler with preventDefault
  const handleClick = (e) => {
    e.preventDefault();  // 👈 Form submit hone se rokega
    e.stopPropagation(); // 👈 Event bubbling rokega
    console.log("👆 Google button clicked at:", new Date().toISOString());
    console.log("👆 Button type:", type);
    
    if (type === "redirect") {
      console.log("👆 Calling handleRedirectLogin");
      handleRedirectLogin(e);
    } else {
      console.log("👆 Calling handleTokenLogin");
      handleTokenLogin(e);
    }
  };

  return (
    <button
      type="button"  // 👈 YEH SABSE IMPORTANT HAI!
      onClick={handleClick}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      <span className="text-gray-700 dark:text-gray-200 font-medium">
        Continue with Google
      </span>
    </button>
  );
};

export default GoogleLoginButton;