import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckAuth } from "../Helpers/APIConnector";

type AuthStatus = "checking" | "authorized" | "unauthorized";

const useIsLogin = (watch?: any, redirectTo = ""): AuthStatus => {
  const nav = useNavigate();
  const [status, setStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
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
  }, [watch]);

  return status;
};

export default useIsLogin;
