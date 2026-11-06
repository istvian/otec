import { Link, useNavigate } from "react-router-dom";
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
  const rutasExcluidas = ["/login", "/register", ];

  if (!rutasExcluidas.includes(window.location.pathname))
    return (
      <nav className={css.nav}>
        <Link to={"/"}>
          <img
            src="/logo.webp"
            alt="Logo de empresa KeepLearning"
            className={css.logo}
          />
        </Link>
        <div className={css.links}>
          <Ruta nombre="Negocios" ruta="/negocios" />
          <Ruta nombre="Catalogo" ruta="/catalogo" />
          <Ruta nombre="Empresas" ruta="/empresas" />
        </div>
        <Btn onClick={HandleLogOut} warning>
          Cerrar sesión
        </Btn>
      </nav>
    );
}
