import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserLogin } from "@/redux/slices/authSlice";
import apiClient from "@/api/axiosConfig";

/**
 * OAuth redirect — cookies are set by the server before redirect.
 * This page loads profile via cookie-authenticated API.
 */
export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      navigate(`/login?error=${error}`, { replace: true });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await apiClient.get("/auth/session");
        if (cancelled) return;

        const payload = res.data?.data ?? res.data;
        if (!payload?.authenticated || !payload?.user) {
          throw new Error("No session");
        }

        dispatch(
          setUserLogin({
            user: payload.user,
            role: payload.role,
          }),
        );

        navigate("/", { replace: true });
      } catch {
        if (cancelled) return;
        setMessage("Could not complete sign-in. Redirecting to login…");
        setTimeout(() => {
          navigate("/login?error=profile_failed", { replace: true });
        }, 1200);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch, navigate, searchParams]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center text-muted-foreground">
      {message}
    </div>
  );
}
