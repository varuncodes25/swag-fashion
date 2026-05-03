import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserLogin } from "@/redux/slices/authSlice";
import apiClient from "@/api/axiosConfig";

/**
 * OAuth redirect flow lands here with ?token=&refreshToken= (no user payload).
 * Loads profile once tokens are stored so Redux matches One Tap login behaviour.
 */
export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");

    if (!token) {
      navigate("/login?error=auth_failed", { replace: true });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        localStorage.setItem("token", token);
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }

        const res = await apiClient.get("/users/profile");
        if (cancelled) return;

        const body = res.data?.data ?? res.data;
        const user = {
          id: body._id ?? body.id,
          name: body.name,
          email: body.email,
          role: body.role,
          avatar: body.avatar,
          isEmailVerified: body.isEmailVerified,
          provider: body.provider,
        };

        dispatch(
          setUserLogin({
            token,
            refreshToken: refreshToken || "",
            user,
          }),
        );

        navigate("/", { replace: true });
      } catch {
        if (cancelled) return;
        setMessage("Could not complete sign-in. Redirecting to login…");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
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
