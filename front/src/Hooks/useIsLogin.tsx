import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckAuth } from "../Helpers/APIConnector";

type AuthStatus = "checking" | "authorized" | "unauthorized";

const useIsLogin = (
  watch?: any,
  redirectTo = "",
  enabled = true,
): AuthStatus => {
  const nav = useNavigate();
  const [status, setStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    setStatus("checking");

    CheckAuth().then((res) => {
      if (cancelled) return;

      if (!res?.error) {
        setStatus("authorized");
        // Solo redirige si se especificó un destino
        if (redirectTo) nav(redirectTo);
      } else {
        setStatus("unauthorized");
        nav("/login");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [watch, enabled]);

  return enabled ? status : "authorized";
};

export default useIsLogin;
