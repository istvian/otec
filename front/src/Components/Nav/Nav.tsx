import { useNavigate } from "react-router-dom";
import { LogOut } from "../../Helpers/APIConnector";
import useIsLogin from "../../Hooks/useIsLogin";
import { Btn } from "../Btn/Btn";
import { Ruta } from "../Ruta/Ruta";
import css from "./Nav.module.css";

export function Nav() {
  const nav = useNavigate();
  const status = useIsLogin();

  function HandleLogOut() {
    if (!confirm("¿Desea cerrar sesión?")) return;
    LogOut().then((res) => {
      if (!res?.error) {
        alert("Se ha cerrado la sesión correctamente");
        nav("/login");
      }
    });
  }
  return (
    <nav className={css.nav}>
      <img
        src="/logo.webp"
        alt="Logo de empresa KeepLearning"
        className={css.logo}
      />
      <div className={css.links}>
        <Ruta nombre="Negocios" ruta="/negocios" />
        <Ruta nombre="Catalogo" ruta="/catalogo" />
      </div>
      <Btn onClick={HandleLogOut} warning>
        Cerrar sesión
      </Btn>
    </nav>
  );
}
