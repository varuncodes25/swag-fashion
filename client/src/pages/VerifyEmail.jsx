import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { verifyEmail } from "@/redux/slices/authSlice";

export default function VerifyEmail() {
  const { token } = useParams();
  const dispatch = useDispatch();
  const [state, setState] = useState("loading");

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }
    dispatch(verifyEmail(token))
      .unwrap()
      .then(() => setState("ok"))
      .catch(() => setState("fail"));
  }, [dispatch, token]);

  if (state === "loading") {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <p>Verifying your email…</p>
      </div>
    );
  }

  if (state === "ok") {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Email verified</h1>
        <p className="text-muted-foreground">You can sign in now.</p>
        <Link
          to="/login"
          className="text-primary font-medium underline underline-offset-4"
        >
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold text-foreground">Verification failed</h1>
      <p className="text-muted-foreground max-w-md">
        The link may be invalid or expired. Sign up again or use forgot password if you
        already have an account.
      </p>
      <div className="flex gap-4">
        <Link
          to="/signup"
          className="text-primary font-medium underline underline-offset-4"
        >
          Sign up
        </Link>
        <Link
          to="/login"
          className="text-primary font-medium underline underline-offset-4"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
