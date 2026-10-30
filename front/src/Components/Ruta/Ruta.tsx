import { Link } from "react-router-dom";
import css from "./Ruta.module.css";

interface RutaProps {
  nombre: string;
  ruta: string;
}

export function Ruta({ nombre, ruta }: RutaProps) {
  return (
    <Link to={ruta} className={css.ruta}>
      {nombre}
    </Link>
  );
}
