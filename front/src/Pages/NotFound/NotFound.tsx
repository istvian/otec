import { Link } from "react-router-dom";
import { Frame } from "../../Components/Frame/Frame";
import { Title } from "../../Components/Title/Title";

export function NotFound() {
  return (
    <Frame>
      <Title>Error 404: Esta ruta no existe o esta en desarrollo</Title>
      <Link to="/">Volver a el inicio</Link>
    </Frame>
  );
}
