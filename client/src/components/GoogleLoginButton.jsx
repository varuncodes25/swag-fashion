import React, { useState } from "react";
import apiClient from "@/api/axiosConfig";
import { useDispatch } from "react-redux";
import { Loader2 } from "lucide-react";
import { setUserLogin } from "@/redux/slices/authSlice";
import { useToast } from "@/hooks/use-toast";

const jsonHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

/** When the API returns HTML (wrong URL / proxy) or a Blob body, axios error text looks like "[object Blob]". */
async function getGoogleAuthErrorMessage(error) {
  const data = error.response?.data;
  if (data?.message && typeof data.message === "string") {
    return data.message;
  }
  if (data instanceof Blob) {
    try {
      const text = await data.text();
      try {
        const parsed = JSON.parse(text);
        return parsed.message || text.slice(0, 200);
      } catch {
        return text.slice(0, 200) || "Invalid server response (not JSON). Check VITE_API_URL.";
      }
    } catch {
      return "Could not read server error. Check API URL and CORS.";
    }
  }
  if (typeof data === "string") {
    return data.slice(0, 200);
  }
  if (!error.response) {
    return "Network error — check API is reachable and CORS allows your site.";
  }
  return error.message || "Google authentication failed";
}

const GoogleLoginButton = ({ type = "redirect" }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [isWorking, setIsWorking] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Connecting…");

  const startLoading = (message) => {
    setLoadingMessage(message);
    setIsWorking(true);
  };

  const stopLoading = () => {
    setIsWorking(false);
    setLoadingMessage("Connecting…");
  };

  const handleRedirectLogin = async (e) => {
    e?.preventDefault();
    startLoading("Redirecting to Google…");

    try {
      const res = await apiClient.get("/auth/google/url", { headers: jsonHeaders });
      window.location.href = res.data.url;
    } catch (error) {
      toast({
        title: "Login Failed",
        description: await getGoogleAuthErrorMessage(error),
        variant: "destructive",
      });
      stopLoading();
    }
  };

  const handleTokenLogin = (e) => {
    e?.preventDefault();
    startLoading("Opening Google…");

    const existingScript = document.querySelector('script[src*="gsi/client"]');

    if (existingScript) {
      if (window.google) {
        initializeGoogleSignIn();
      } else {
        toast({
          title: "Try again",
          description: "Google sign-in is still loading. Wait a moment and tap again.",
        });
        stopLoading();
      }
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = () => initializeGoogleSignIn();

    script.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to load Google Sign-In. Trying browser redirect instead…",
        variant: "destructive",
      });
      void handleRedirectLogin();
    };

    document.body.appendChild(script);
  };

  const initializeGoogleSignIn = () => {
    if (!window.google?.accounts?.id) {
      stopLoading();
      toast({
        title: "Google Sign-In",
        description: "Could not load Google. Try again or use email login.",
        variant: "destructive",
      });
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      setLoadingMessage("Select your Google account…");

      window.google.accounts.id.prompt((notification) => {
        if (notification.isDismissedMoment?.()) {
          stopLoading();
        }
        if (
          notification.isNotDisplayed?.() ||
          notification.isSkippedMoment?.()
        ) {
          void handleRedirectLogin();
        }
      });
    } catch (error) {
      stopLoading();
      toast({
        title: "Google Sign-In",
        description: "Could not start Google picker. Try again or use email login.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleResponse = async (response) => {
    startLoading("Signing in…");

    try {
      const res = await apiClient.post("/auth/google/token", {
        token: response.credential,
      });

      dispatch(setUserLogin(res.data));

      toast({
        title: "Login Successful",
        description: `Welcome ${res.data.user?.name || "User"}!`,
      });

      window.location.href = "/";
    } catch (error) {
      toast({
        title: "Login Failed",
        description: await getGoogleAuthErrorMessage(error),
        variant: "destructive",
      });
      stopLoading();
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isWorking) return;

    if (type === "redirect") {
      void handleRedirectLogin(e);
    } else {
      handleTokenLogin(e);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isWorking}
      aria-busy={isWorking}
      aria-label={isWorking ? loadingMessage : "Continue with Google"}
      className={`relative w-full flex items-center justify-center gap-3 rounded-lg border px-4 py-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98] dark:focus-visible:ring-offset-gray-950 ${
        isWorking
          ? "cursor-wait border-primary/30 bg-primary/5 dark:bg-primary/10"
          : "border-gray-300 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:hover:bg-gray-800"
      }`}
    >
      {isWorking ? (
        <Loader2
          className="h-5 w-5 shrink-0 animate-spin text-primary"
          aria-hidden
        />
      ) : (
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
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
      )}
      <span
        className={`font-medium ${
          isWorking ? "text-primary" : "text-gray-700 dark:text-gray-200"
        }`}
      >
        {isWorking ? loadingMessage : "Continue with Google"}
      </span>
    </button>
  );
};

export default GoogleLoginButton;
