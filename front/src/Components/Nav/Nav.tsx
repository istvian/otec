import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "../../Helpers/APIConnector";
import useIsLogin from "../../Hooks/useIsLogin";
import { Btn } from "../Btn/Btn";
import { Ruta } from "../Ruta/Ruta";
import css from "./Nav.module.css";

export function Nav() {
  const nav = useNavigate();
  const location = useLocation();
  const rutaActual = location.pathname;
  const esRutaPublica = rutaActual.startsWith("/cotizaciones/publica");
  useIsLogin(undefined, "", !esRutaPublica);

  function HandleLogOut() {
    if (!confirm("¿Desea cerrar sesión?")) return;
    LogOut().then((res) => {
      if (!res?.error) {
        alert("Se ha cerrado la sesión correctamente");
        nav("/login");
      }
    });
  }
  const rutasExcluidas = ["/login", "/register"];

  if (!rutasExcluidas.includes(rutaActual) && !esRutaPublica)
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
          <Ruta nombre="Respaldos" ruta="/respaldos" />
          <Ruta nombre="Relatores" ruta="/relatores" />
          <Ruta nombre="Cobros" ruta="/cobros" />
          <Ruta nombre="Cotizaciones" ruta="/cotizaciones" />
          <Ruta nombre="Catalogo" ruta="/catalogo" />
          <Ruta nombre="Empresas" ruta="/empresas" />
          <Ruta nombre="Admin" ruta="/admin" />
        </div>
        <Btn onClick={HandleLogOut} warning>
          Cerrar sesión
        </Btn>
      </nav>
    );
}
