import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { restoreSession } from "@/redux/slices/authSlice";

/** On app load, validate HttpOnly cookie session with the API */
export default function SessionBootstrap({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  return children;
}
